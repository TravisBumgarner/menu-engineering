import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { visuallyHidden } from '@mui/utils'
import type * as React from 'react'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import { PALETTE } from '../../../../../styles/consts'
import { isSortable, type SORTABLE_OPTIONS } from './consts'

interface HeadCell {
  disablePadding: boolean
  id: 'title' | 'cost' | 'actions' | 'createdAt' | 'quantity' | 'units' | 'unitCost'
  label: string
  align: 'left' | 'right' | 'center'
  width: string
}

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: 'title' | 'createdAt') => void
  order: 'asc' | 'desc'
  orderBy: string | number
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { t } = useAppTranslation()
  const { order, orderBy, onRequestSort } = props

  const headCells: readonly HeadCell[] = [
    {
      id: 'createdAt',
      align: 'left',
      disablePadding: true,
      label: t('created'),
      width: '10%',
    },
    {
      id: 'title',
      align: 'left',
      disablePadding: true,
      label: t('title'),
      width: '30%',
    },
    {
      id: 'quantity',
      align: 'right',
      disablePadding: true,
      label: t('quantity'),
      width: '75px',
    },
    {
      id: 'units',
      align: 'left',
      disablePadding: true,
      label: t('units'),
      width: '30px',
    },
    {
      id: 'unitCost',
      align: 'right',
      disablePadding: true,
      label: t('unitCost'),
      width: '15%',
    },
    {
      id: 'cost',
      align: 'right',
      disablePadding: true,
      label: t('totalCost'),
      width: '15%',
    },
    {
      id: 'actions',
      align: 'right',
      disablePadding: false,
      label: '',
      width: '30%',
    },
  ]

  const createSortHandler = (property: keyof typeof SORTABLE_OPTIONS) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            sx={{
              width: headCell.width,
              border: 'none',
            }}
            key={headCell.id}
            align={headCell.align}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {isSortable(headCell.id) ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

export default EnhancedTableHead
