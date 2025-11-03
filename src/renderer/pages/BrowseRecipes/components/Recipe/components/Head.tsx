import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { visuallyHidden } from '@mui/utils'
import * as React from 'react'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import { isSortable, SORTABLE_OPTIONS } from './consts'

interface HeadCell {
  disablePadding: boolean
  id: 'title' | 'cost' | 'actions'
  label: string
  align: 'left' | 'right' | 'center'
}

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: 'title') => void
  order: 'asc' | 'desc'
  orderBy: string | number
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { t } = useAppTranslation()
  const { order, orderBy, onRequestSort } = props

  const headCells: readonly HeadCell[] = [
    {
      id: 'title',
      align: 'left',
      disablePadding: true,
      label: t('title'),
    },
    {
      id: 'cost',
      align: 'right',
      disablePadding: true,
      label: t('cost'),
    },
    {
      id: 'actions',
      align: 'center',
      disablePadding: false,
      label: t('actions'),
    },
  ]

  const createSortHandler =
    (property: keyof typeof SORTABLE_OPTIONS) =>
    (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

  return (
    <TableHead>
      <TableRow>
        <TableCell width={30} />
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
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
                    {order === 'desc'
                      ? 'sorted descending'
                      : 'sorted ascending'}
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
