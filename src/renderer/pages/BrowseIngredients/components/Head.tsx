import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { visuallyHidden } from '@mui/utils'
import * as React from 'react'
import { IngredientDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'

interface HeadCell {
  disablePadding: boolean
  id: keyof IngredientDTO | 'actions'
  label: string
  align: 'left' | 'right' | 'center'
  width: string
}

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof IngredientDTO,
  ) => void

  order: 'asc' | 'desc'
  orderBy: string | number | symbol
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
      width: '20%',
    },
    {
      id: 'title',
      align: 'left',
      disablePadding: true,
      label: t('title'),
      width: '20%',
    },
    {
      id: 'units',
      align: 'left',
      disablePadding: false,
      label: t('units'),
      width: '20%',
    },
    {
      id: 'unitCost',
      align: 'right',
      disablePadding: false,
      width: '20%',
      label: t('unitCost'),
    },
    {
      id: 'actions',
      align: 'left',
      disablePadding: false,
      width: '20%',
      label: t('actions'),
    },
  ]

  const createSortHandler =
    (property: keyof IngredientDTO) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

  return (
    <TableHead>
      <TableRow>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === 'actions' ? (
              headCell.label
            ) : (
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
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

export default EnhancedTableHead
