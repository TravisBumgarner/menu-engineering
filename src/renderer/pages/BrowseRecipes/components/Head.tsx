import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { visuallyHidden } from '@mui/utils'
import * as React from 'react'
import { RecipeDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import { SPACING } from '../../../styles/consts'

interface HeadCell {
  disablePadding: boolean
  id: keyof RecipeDTO | 'actions' | 'collapse' | 'cost'
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
      id: 'collapse',
      align: 'left',
      disablePadding: true,
      label: '',
      width: '4%',
    },
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
      id: 'cost',
      align: 'left',
      disablePadding: true,
      label: t('cost'),
      width: '10%',
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
      align: 'left',
      disablePadding: false,
      label: t('status'),
      width: '10%',
    },
    {
      id: 'showInMenu',
      align: 'left',
      disablePadding: false,
      label: t('showInMenu'),
      width: '15%',
    },
    {
      id: 'actions',
      align: 'center',
      disablePadding: false,
      label: '',
      width: '5%',
    },
  ]

  const createSortHandler =
    (property: keyof RecipeDTO) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

  return (
    <TableHead>
      <TableRow>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, padding: `0 ${SPACING.SMALL.PX}` }}
          >
            {headCell.id === 'actions' ||
            headCell.id === 'collapse' ||
            headCell.id === 'cost' ? (
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
