import { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  ConfirmationDialog,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  ListSkeleton,
  Modal,
  PromptDialog,
  SearchInput,
  Select,
} from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { ENV_COLLECTION_CATEGORIES, ENV_ENVIRONMENTS } from '../../constants';
import {
  useAddEnvVariableMutation,
  useCopyEnvVariableMutation,
  useCreateEnvCollectionMutation,
  useDeleteEnvCollectionMutation,
  useDeleteEnvVariableMutation,
  useDuplicateEnvVariableMutation,
  useExportEnvCollectionMutation,
  useFavoriteEnvCollectionMutation,
  useGetEnvCollectionQuery,
  useGetEnvCollectionsQuery,
  useGetEnvMetaQuery,
  useImportEnvVariablesMutation,
  usePreviewEnvFileMutation,
  useRevealEnvVariableMutation,
  useUpdateEnvVariableMutation,
} from '../../features/secrets/secretsApi';
import { useDebounce } from '../../hooks/useDebounce';
import { copyAndExpire } from '../../utils/clipboard';
import { formatDateTime } from '../../utils/format';
import { ShareModal } from '../../components/sharing/ShareModal';

export function SecretsPage() {
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [environment, setEnvironment] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', environment: 'development', category: 'Work' });
  const [varForm, setVarForm] = useState({ key: '', value: '' });
  const [revealed, setRevealed] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [removeCollection, setRemoveCollection] = useState(false);
  const [removingVar, setRemovingVar] = useState(null);
  const [renamingVar, setRenamingVar] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const hideTimer = useRef(0);
  const search = useDebounce(query, 250);

  const { data, isLoading, error, refetch } = useGetEnvCollectionsQuery({
    q: search || undefined,
    environment: environment || undefined,
  });
  const { data: metaData } = useGetEnvMetaQuery();
  const { data: detailData } = useGetEnvCollectionQuery(selectedId, { skip: !selectedId });
  const [createCollection, createState] = useCreateEnvCollectionMutation();
  const [favoriteCollection] = useFavoriteEnvCollectionMutation();
  const [deleteCollection, deleteState] = useDeleteEnvCollectionMutation();
  const [addVariable, addState] = useAddEnvVariableMutation();
  const [updateVariable, updateVarState] = useUpdateEnvVariableMutation();
  const [deleteVariable, deleteVarState] = useDeleteEnvVariableMutation();
  const [revealVariable, revealState] = useRevealEnvVariableMutation();
  const [copyVariable] = useCopyEnvVariableMutation();
  const [duplicateVariable] = useDuplicateEnvVariableMutation();
  const [previewEnv] = usePreviewEnvFileMutation();
  const [importVariables, importState] = useImportEnvVariablesMutation();
  const [exportCollection, exportState] = useExportEnvCollectionMutation();

  const collections = data?.data?.collections || [];
  const meta = metaData?.data || {};
  const selected = detailData?.data?.collection || collections.find((item) => item.id === selectedId);
  const variables = selected?.variables || [];
  const hideMs = meta.revealHideMs || 8000;
  const clipboardMs = meta.clipboardClearMs || 30000;

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  function hideSecret() {
    window.clearTimeout(hideTimer.current);
    setRevealed(null);
  }

  async function reveal(id) {
    try {
      const result = await revealVariable(id).unwrap();
      setRevealed({ id, value: result.data?.value || '' });
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setRevealed(null), result.data?.hideAfterMs || hideMs);
      revealState.reset();
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to unlock' });
    }
  }

  async function copy(id) {
    try {
      const result = await copyVariable(id).unwrap();
      await copyAndExpire(result.data?.value || '', result.data?.clipboardClearMs || clipboardMs);
      push({ tone: 'success', title: 'Value copied', message: 'Clipboard will clear shortly.', as: 'toast' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Copy failed', as: 'toast' });
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    try {
      const result = await createCollection(createForm).unwrap();
      setSelectedId(result.data?.collection?.id || '');
      setCreateOpen(false);
      push({ tone: 'success', title: 'Collection created' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to create collection' });
    }
  }

  async function handleAddVariable(event) {
    event.preventDefault();
    try {
      await addVariable({ collectionId: selectedId, ...varForm }).unwrap();
      setVarForm({ key: '', value: '' });
      push({ tone: 'success', title: 'Variable stored' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to add variable' });
    }
  }

  async function handleExport() {
    try {
      const result = await exportCollection(selectedId).unwrap();
      const blob = new Blob([result.data?.content || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.data?.filename || 'export.env';
      link.click();
      URL.revokeObjectURL(url);
      push({ tone: 'success', title: 'Export downloaded' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Export failed' });
    }
  }

  async function onPickEnv(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const preview = await previewEnv({ text }).unwrap();
      const rows = preview.data?.entries || [];
      setImportRows(rows.map((row) => ({ ...row, value: '' })));
      setSelectedKeys(rows.map((row) => row.key));
      const parsed = text.split(/\r?\n/).reduce((map, raw) => {
        const line = raw.trim();
        if (!line || line.startsWith('#') || !line.includes('=')) return map;
        let [key, ...rest] = line.replace(/^export\s+/, '').split('=');
        key = key.trim();
        let value = rest.join('=');
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        map[key] = value;
        return map;
      }, {});
      setImportRows(rows.map((row) => ({ ...row, value: parsed[row.key] || '' })));
      setImportOpen(true);
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Could not parse that file' });
    }
    event.target.value = '';
  }

  async function confirmImport() {
    try {
      const entries = importRows.filter((row) => selectedKeys.includes(row.key)).map((row) => ({ key: row.key, value: row.value }));
      const result = await importVariables({ collectionId: selectedId, entries }).unwrap();
      setImportOpen(false);
      push({ tone: 'success', title: `Imported ${result.data?.imported || 0}`, message: `${result.data?.skipped || 0} skipped` });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Import failed' });
    }
  }

  if (error && !collections.length) {
    return <div className="workspace-fallback"><ErrorState title="ENV stayed locked" message={error?.data?.message} onRetry={refetch} /></div>;
  }

  return (
    <div className="workspace vault-workspace secrets-workspace">
      <aside className="vault-rail">
        <div className="notes-rail-head">
          <div>
            <p className="page-kicker page-kicker-gold">Developer vault</p>
            <h1 className="st-page-title" style={{ fontSize: 24, lineHeight: '32px' }}>ENV</h1>
          </div>
          <Button size="sm" icon="plus" onClick={() => setCreateOpen(true)}>New</Button>
        </div>
        <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search collections" />
        <Select value={environment} onChange={(event) => setEnvironment(event.target.value)} aria-label="Environment">
          <option value="">All environments</option>
          {(meta.environments?.length ? meta.environments : ENV_ENVIRONMENTS).map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
        <div className="vault-list">
          {isLoading && !collections.length ? (
            <ListSkeleton variant="card" count={4} />
          ) : !collections.length ? (
            <EmptyState icon="key" title="No collections yet" message="Create a project like Greenwich Website or ERP Backend." actionLabel="New collection" onAction={() => setCreateOpen(true)} />
          ) : collections.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`vault-card ${item.id === selectedId ? 'is-active' : ''}`}
              onClick={() => { hideSecret(); setSelectedId(item.id); }}
            >
              <span className="vault-mark">{item.name.slice(0, 1).toUpperCase()}</span>
              <div className="vault-card-copy">
                <strong>{item.name}{item.favorite ? <Icon name="star" size={12} /> : null}</strong>
                <p>{item.environment} · {item.variableCount || 0} variables</p>
                <Badge>{item.category}</Badge>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="vault-stage">
        {!selected ? (
          <EmptyState icon="key" title="Select a collection" message="Values stay encrypted until you reveal one variable." />
        ) : (
          <>
            <header className="vault-stage-head">
              <div>
                <p className="page-kicker page-kicker-gold">{selected.environment}</p>
                <h2>{selected.name}</h2>
                <p className="muted">{selected.variableCount || variables.length} variables · updated {formatDateTime(selected.updatedAt)}</p>
              </div>
              <div className="vault-actions">
                <button type="button" className={`money-icon-btn ${selected.favorite ? 'is-on' : ''}`} onClick={() => favoriteCollection(selected.id)} aria-label="Favorite">
                  <Icon name="star" size={16} />
                </button>
                <label className="btn btn-secondary btn-sm">
                  Import .env
                  <input type="file" accept=".env,text/plain" hidden onChange={onPickEnv} />
                </label>
                <Button size="sm" variant="secondary" loading={exportState.isLoading} onClick={handleExport}>Export .env</Button>
                <button type="button" className="money-icon-btn" onClick={() => setShareOpen(true)} aria-label="Share">
                  <Icon name="share" size={16} />
                </button>
                <Button size="sm" variant="ghost" onClick={() => setRemoveCollection(true)}>Delete</Button>
              </div>
            </header>

            <form className="env-add" onSubmit={handleAddVariable}>
              <Input placeholder="MONGODB_URI" value={varForm.key} onChange={(event) => setVarForm((current) => ({ ...current, key: event.target.value }))} required />
              <Input placeholder="Secret value" type="password" autoComplete="off" value={varForm.value} onChange={(event) => setVarForm((current) => ({ ...current, value: event.target.value }))} required />
              <Button type="submit" loading={addState.isLoading}>Add variable</Button>
            </form>

            <div className="env-list">
              {variables.map((item) => {
                const shown = revealed && revealed.id === item.id ? revealed.value : '';
                return (
                  <div key={item.id} className="env-row">
                    <div className="env-row-main">
                      <span className="env-key" title={item.key}>{item.key}</span>
                      <code className="env-value" title={shown || undefined}>{shown || '••••••••'}</code>
                      <div className="env-row-quick">
                        <button
                          type="button"
                          className="money-icon-btn"
                          aria-label={shown ? 'Hide value' : 'Show value'}
                          onClick={() => (shown ? hideSecret() : reveal(item.id))}
                        >
                          <Icon name={shown ? 'eyeOff' : 'eye'} size={16} />
                        </button>
                        <button type="button" className="money-icon-btn" aria-label="Copy value" onClick={() => copy(item.id)}>
                          <Icon name="copy" size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="env-row-more">
                      <button
                        type="button"
                        className="text-link"
                        onClick={async () => {
                          try {
                            await duplicateVariable(item.id).unwrap();
                            push({ tone: 'success', title: 'Variable duplicated' });
                          } catch (err) {
                            push({ tone: 'danger', title: err?.data?.message || 'Unable to duplicate' });
                          }
                        }}
                      >
                        Duplicate
                      </button>
                      <button type="button" className="text-link" onClick={() => setRenamingVar(item)}>Rename</button>
                      <button type="button" className="text-link is-danger" onClick={() => setRemovingVar(item)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <Modal
        open={createOpen}
        title="New ENV collection"
        onClose={() => setCreateOpen(false)}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button form="env-create" type="submit" loading={createState.isLoading}>Create</Button>
          </>
        )}
      >
        <form id="env-create" className="auth-form" onSubmit={handleCreate}>
          <Input label="Name" value={createForm.name} onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))} required placeholder="Greenwich Website" />
          <Select label="Environment" value={createForm.environment} onChange={(event) => setCreateForm((current) => ({ ...current, environment: event.target.value }))}>
            {ENV_ENVIRONMENTS.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Select label="Category" value={createForm.category} onChange={(event) => setCreateForm((current) => ({ ...current, category: event.target.value }))}>
            {ENV_COLLECTION_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </form>
      </Modal>

      <Modal
        open={importOpen}
        title="Import .env"
        size="lg"
        onClose={() => setImportOpen(false)}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => setSelectedKeys(importRows.map((row) => row.key))}>Select all</Button>
            <Button loading={importState.isLoading} onClick={confirmImport}>Import selected</Button>
          </>
        )}
      >
        <div className="env-list">
          {importRows.map((row) => (
            <label key={row.key} className="env-import-row">
              <input
                type="checkbox"
                checked={selectedKeys.includes(row.key)}
                onChange={(event) => setSelectedKeys((current) => (
                  event.target.checked ? [...current, row.key] : current.filter((key) => key !== row.key)
                ))}
              />
              <strong className="env-key">{row.key}</strong>
              <span className="env-value">{row.masked}</span>
            </label>
          ))}
        </div>
      </Modal>

      <ShareModal
        open={shareOpen}
        resourceType="secret"
        resourceId={selected?.id}
        title={selected?.name}
        onClose={() => setShareOpen(false)}
      />
      <ConfirmationDialog
        open={removeCollection}
        title="Delete this collection?"
        message="Every encrypted variable in it is removed. This cannot be undone."
        loading={deleteState.isLoading}
        onClose={() => setRemoveCollection(false)}
        onConfirm={async () => {
          try {
            await deleteCollection(selectedId).unwrap();
            setRemoveCollection(false);
            setSelectedId('');
            push({ tone: 'success', title: 'Collection deleted' });
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Unable to delete collection' });
          }
        }}
      />
      <PromptDialog
        open={Boolean(renamingVar)}
        title="Rename variable"
        label="Key"
        value={renamingVar?.key || ''}
        confirmLabel="Rename"
        loading={updateVarState.isLoading}
        onClose={() => setRenamingVar(null)}
        onSubmit={async (key) => {
          try {
            await updateVariable({ variableId: renamingVar.id, key }).unwrap();
            setRenamingVar(null);
            push({ tone: 'success', title: 'Variable renamed' });
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Unable to rename' });
          }
        }}
      />
      <ConfirmationDialog
        open={Boolean(removingVar)}
        title="Delete this variable?"
        message={`${removingVar?.key || 'This key'} will be removed from the collection.`}
        confirmLabel="Delete"
        loading={deleteVarState.isLoading}
        onClose={() => setRemovingVar(null)}
        onConfirm={async () => {
          try {
            await deleteVariable(removingVar.id).unwrap();
            if (revealed?.id === removingVar.id) hideSecret();
            setRemovingVar(null);
            push({ tone: 'success', title: 'Variable deleted' });
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Unable to delete variable' });
          }
        }}
      />
    </div>
  );
}
