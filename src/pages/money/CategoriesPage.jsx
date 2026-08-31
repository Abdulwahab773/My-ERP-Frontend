import { useState } from 'react';
import { Badge, Button, ConfirmationDialog, EmptyState, Input, ListSkeleton, PromptDialog } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from '../../features/finance/financeApi';
import { MoneyNav } from './MoneyNav';

export function CategoriesPage() {
  const { data, isLoading } = useGetCategoriesQuery({ archived: '1' });
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory, updateState] = useUpdateCategoryMutation();
  const [deleteCategory, deleteState] = useDeleteCategoryMutation();
  const { push } = useToast();
  const [incomeName, setIncomeName] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [renaming, setRenaming] = useState(null);
  const [removing, setRemoving] = useState(null);
  const categories = data?.data?.categories || [];

  async function add(kind, name, clear) {
    try {
      await createCategory({ kind, name }).unwrap();
      clear('');
      push({ tone: 'success', title: 'Category created' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to create category' });
    }
  }

  async function archive(item) {
    try {
      await updateCategory({ categoryId: item.id, archived: !item.archived }).unwrap();
      push({ tone: 'success', title: item.archived ? 'Category restored' : 'Category archived' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to update category' });
    }
  }

  return (
    <div className="st-page">
      <MoneyNav />
      <header className="mb-lg">
        <h1 className="st-page-title">Categories</h1>
        <p className="st-page-lead">Income and expense labels are yours. Archive instead of deleting when records exist.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <CategoryColumn
          title="Income"
          icon="download"
          loading={isLoading}
          name={incomeName}
          setName={setIncomeName}
          items={categories.filter((item) => item.kind === 'income')}
          onAdd={() => add('income', incomeName, setIncomeName)}
          onArchive={archive}
          onRename={setRenaming}
          onDelete={setRemoving}
        />
        <CategoryColumn
          title="Expenses"
          icon="upload"
          loading={isLoading}
          name={expenseName}
          setName={setExpenseName}
          items={categories.filter((item) => item.kind === 'expense')}
          onAdd={() => add('expense', expenseName, setExpenseName)}
          onArchive={archive}
          onRename={setRenaming}
          onDelete={setRemoving}
        />
      </div>

      <PromptDialog
        open={Boolean(renaming)}
        title="Rename category"
        label="Name"
        value={renaming?.name || ''}
        confirmLabel="Rename"
        loading={updateState.isLoading}
        onClose={() => setRenaming(null)}
        onSubmit={async (name) => {
          try {
            await updateCategory({ categoryId: renaming.id, name }).unwrap();
            setRenaming(null);
            push({ tone: 'success', title: 'Category renamed' });
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Unable to rename' });
          }
        }}
      />
      <ConfirmationDialog
        open={Boolean(removing)}
        title="Delete this category?"
        message="If records already use it, archive instead. Delete only removes unused labels."
        confirmLabel="Delete"
        loading={deleteState.isLoading}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          try {
            await deleteCategory(removing.id).unwrap();
            setRemoving(null);
            push({ tone: 'success', title: 'Category deleted' });
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Archive it instead' });
          }
        }}
      />
    </div>
  );
}

function CategoryColumn({ title, icon, items, loading, name, setName, onAdd, onArchive, onRename, onDelete }) {
  return (
    <section className="bento-card">
      <div className="flex items-center gap-xs border-b border-outline-variant pb-sm mb-md">
        <MsIcon name={icon} className="text-primary" />
        <h2 className="font-headline-md text-headline-md">{title}</h2>
        <span className="ml-auto font-label-md text-on-surface-variant">{items.filter((item) => !item.archived).length} active</span>
      </div>
      <form
        className="flex gap-sm mb-md"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) onAdd();
        }}
      >
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={`New ${title.toLowerCase()} category`} />
        <Button type="submit" size="sm">Add</Button>
      </form>
      {loading && !items.length ? (
        <ListSkeleton variant="line" count={4} />
      ) : !items.length ? (
        <EmptyState title="No categories" />
      ) : (
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-sm py-sm border-b border-outline-variant last:border-0">
              <div>
                <strong className="font-body-md">{item.name}</strong>
                <div className="flex gap-xs mt-1">
                  {item.isDefault ? <Badge>Default</Badge> : null}
                  {item.archived ? <Badge tone="gold">Archived</Badge> : null}
                </div>
              </div>
              <div className="flex gap-sm category-actions">
                <button type="button" className="text-link" onClick={() => onRename(item)}>Rename</button>
                <button type="button" className="text-link" onClick={() => onArchive(item)}>{item.archived ? 'Restore' : 'Archive'}</button>
                <button type="button" className="text-link" onClick={() => onDelete(item)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
