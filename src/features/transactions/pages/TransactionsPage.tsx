import { format } from "date-fns";
import { Plus, ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import EmptyState from "@/shared/components/EmptyState";
import PageLoader from "@/shared/components/PageLoader";
import TransactionFormModal from "../components/TransactionFormModal";
import TransactionRow, { TRANSACTIONS_GRID_COLS } from "../components/TransactionRow";
import { useTransactionsPageModel } from "./useTransactionsPageModel";
import { useT } from "@/shared/i18n";

export default function TransactionsPage() {
  const t = useT()
  const {
    currentDate,
    modalOpen,
    editing,
    transactions,
    isLoading,
    accountMap,
    runningBalances,
    prevMonth,
    nextMonth,
    openCreateModal,
    handleEdit,
    handleClose,
    handleDelete,
  } = useTransactionsPageModel();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('transactions.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{format(currentDate, "MMMM yyyy")}</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          {t('transactions.addTransaction')}
        </Button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-28 text-center">
            {format(currentDate, "MMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Transaction list */}
      {isLoading ? (
        <PageLoader message={t('transactions.loading')} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title={t('transactions.noTransactions')}
          description={t('transactions.noTransactionsDesc')}
          action={
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              {t('transactions.addFirst')}
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          {/* Desktop column headers */}
          <div
            className={`hidden md:grid ${TRANSACTIONS_GRID_COLS} gap-x-3 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/40 border-b border-border`}
          >
            <span>{t('transactions.colDate')}</span>
            <span>{t('transactions.colDescription')}</span>
            <span>{t('transactions.colAccount')}</span>
            <span>{t('transactions.colCategory')}</span>
            <span className="text-right">{t('transactions.colAmount')}</span>
            <span />
          </div>

          <div className="divide-y divide-border">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                accountMap={accountMap}
                runningBalances={runningBalances}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      <TransactionFormModal open={modalOpen} onClose={handleClose} transaction={editing} />
    </div>
  );
}
