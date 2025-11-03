import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { visuallyHidden } from '@mui/utils'
import * as React from 'react'
import { RecipeDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'

interface HeadCell {
  disablePadding: boolean
  id: keyof RecipeDTO | 'actions'
  label: string
  align: 'left' | 'right' | 'center'
  width: string
}

interface Props {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof RecipeDTO,
  ) => void
  order: 'asc' | 'desc'
  orderBy: string | number | symbol
}

function Head({ onRequestSort, order, orderBy }: Props) {
  const { t } = useAppTranslation()

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
      label: t('recipeName'),
      width: '20%',
    },
    {
      id: 'produces',
      align: 'right',
      disablePadding: false,
      label: t('produces'),
      width: '10%',
    },
    {
      id: 'units',
      align: 'left',
      disablePadding: false,
      label: t('units'),
      width: '10%',
    },
    {
      id: 'status',
      align: 'center',
      disablePadding: false,
      label: t('status'),
      width: '10%',
    },
    {
      id: 'showInMenu',
      align: 'center',
      disablePadding: false,
      label: t('showInMenu'),
      width: '15%',
    },
    {
      id: 'actions',
      align: 'center',
      disablePadding: false,
      label: t('actions'),
      width: '10%',
    },
  ]

  const createSortHandler =
    (property: keyof RecipeDTO) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

  return (
    <TableHead>
      <TableRow>
        <TableCell sx={{ width: '7%' }} />
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width }}
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

export default Head
