import { useHoldingsByAccount } from '@/shared/hooks/useHoldings'
import { useAssets } from '@/shared/hooks/useAssets'
import { useTransactionForm } from './useTransactionForm'
import StandardTransactionForm from './StandardTransactionForm'
import type { Transaction, TransactionType } from '@/domain/types'

interface Props {
  open: boolean
  onClose: () => void
  transaction?: Transaction
  defaultType: TransactionType
  defaultAccountId?: string
  isEditTx: boolean
  currentUserId?: string
}

export default function StandardTransactionTab({
  open,
  onClose,
  transaction,
  defaultType,
  defaultAccountId,
  isEditTx,
  currentUserId,
}: Props) {
  const txHook = useTransactionForm({
    open,
    onClose,
    transaction,
    defaultType,
    defaultAccountId,
  })

  const { selectedAccount, isTransfer } = txHook
  const isInvestAccount = selectedAccount?.type === 'investment' && !isTransfer
  const investAccountId = isInvestAccount && selectedAccount?.id != null ? selectedAccount.id : undefined
  const { data: accountHoldings = [] } = useHoldingsByAccount(investAccountId)
  const { data: allAssets = [] } = useAssets()
  const assetMap = Object.fromEntries(allAssets.map(asset => [asset.id!, asset]))

  return (
    <StandardTransactionForm
      txHook={txHook}
      isEditTx={isEditTx}
      isRoundupEdit={isEditTx && transaction?.category === 'roundup'}
      isInvestAccount={isInvestAccount}
      accountHoldings={accountHoldings}
      assetMap={assetMap}
      currentUserId={currentUserId}
      onClose={onClose}
    />
  )
}
