import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Badge, Button, EmptyState, ListSkeleton, Table } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { selectUser } from '../../features/auth/authSlice';
import { useEmailReportMutation, useGenerateReportMutation, useGetReportsQuery } from '../../features/reports/reportsApi';
import { API_BASE_URL } from '../../store/api/baseApi';
import { currentMonthKey, formatCurrency, formatDateTime, monthLabel, shiftMonthKey } from '../../utils/format';
import { MonthPill } from '../dashboard/MonthSelector';

export function ReportsPage() {
  const user = useSelector(selectUser);
  const currency = user?.currency || 'USD';
  const { push } = useToast();
  const [month, setMonth] = useState(() => shiftMonthKey(currentMonthKey(), -1));
  const { data, error, isLoading } = useGetReportsQuery();
  const [generateReport, generateState] = useGenerateReportMutation();
  const [emailReport, emailState] = useEmailReportMutation();
  const items = data?.data?.items || [];

  async function generate(force = false) {
    try {
      await generateReport({ month, force, send: true }).unwrap();
      push({ tone: 'success', title: `${monthLabel(month)} report is ready` });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to generate report' });
    }
  }

  async function download(report) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${report.id}/download`, { credentials: 'include' });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = report.fileName || `Aether-Report-${report.month}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      push({ tone: 'success', title: 'Download started', as: 'toast' });
    } catch {
      push({ tone: 'danger', title: 'Download failed' });
    }
  }

  async function resend(report) {
    try {
      await emailReport(report.id).unwrap();
      push({ tone: 'success', title: 'Report emailed' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to email report' });
    }
  }

  return (
    <div className="st-page">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h1 className="st-page-title">Monthly reports</h1>
          <p className="st-page-lead">
            Professional PDFs for each closed or current month, emailed to your verified address and kept here for download.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm">
          <MonthPill value={month} onChange={setMonth} maxOffset={0} />
          <Button loading={generateState.isLoading} onClick={() => generate(true)}>
            Generate {monthLabel(month)}
          </Button>
        </div>
      </header>
      {error ? <Alert tone="danger" title={error?.data?.message || 'Reports could not load'} /> : null}
      {!user?.emailVerified ? (
        <Alert tone="warning" title="Verify your email">
          Monthly reports are emailed only to a confirmed address.
        </Alert>
      ) : null}

      {isLoading && !items.length ? (
        <div className="st-panel" style={{ padding: 16 }}><ListSkeleton variant="table" count={5} /></div>
      ) : !items.length ? (
        <EmptyState
          icon="chart"
          title="No reports yet"
          message="Generate last month’s statement, or wait for the month-end job to prepare it."
          actionLabel={`Generate ${monthLabel(month)}`}
          onAction={() => generate(false)}
        />
      ) : (
        <div className="st-panel">
          <Table
            columns={[
              { key: 'label', header: 'Month' },
              { key: 'generatedAt', header: 'Generated', render: (row) => formatDateTime(row.generatedAt) },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <Badge tone={row.status === 'emailed' ? 'success' : row.status === 'failed' ? 'danger' : 'gold'}>{row.status}</Badge>,
              },
              {
                key: 'emailStatus',
                header: 'Email',
                render: (row) => <Badge tone={row.emailStatus === 'sent' ? 'success' : row.emailStatus === 'failed' ? 'danger' : 'neutral'}>{row.emailStatus}</Badge>,
              },
              {
                key: 'summary',
                header: 'Closing',
                render: (row) => formatCurrency(row.summary?.closing || 0, row.summary?.currency || currency),
              },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <div className="row-actions">
                    {row.downloadable ? <Button size="sm" variant="ghost" onClick={() => download(row)}>Download</Button> : null}
                    <Button size="sm" variant="ghost" loading={emailState.isLoading} onClick={() => resend(row)}>Email</Button>
                  </div>
                ),
              },
            ]}
            rows={items}
          />
        </div>
      )}
    </div>
  );
}
