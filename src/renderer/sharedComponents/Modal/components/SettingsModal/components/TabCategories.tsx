import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { CHANNEL } from '../../../../../../shared/messages.types'
import type { CategoryDTO } from '../../../../../../shared/recipe.types'
import { QUERY_KEYS } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import ipcMessenger from '../../../../../ipcMessenger'
import { SPACING } from '../../../../../styles/consts'
import Icon from '../../../../Icon'

const TabCategories = () => {
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()
  const [newCategoryTitle, setNewCategoryTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => ipcMessenger.invoke(CHANNEL.DB.GET_CATEGORIES, undefined),
  })

  const addMutation = useMutation({
    mutationFn: (title: string) => ipcMessenger.invoke(CHANNEL.DB.ADD_CATEGORY, { payload: { title } }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] })
        setNewCategoryTitle('')
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      ipcMessenger.invoke(CHANNEL.DB.UPDATE_CATEGORY, { id, payload: { title } }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        setEditingId(null)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ipcMessenger.invoke(CHANNEL.DB.DELETE_CATEGORY, { id }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
      }
    },
  })

  const handleAdd = () => {
    const trimmed = newCategoryTitle.trim()
    if (!trimmed) return
    addMutation.mutate(trimmed)
  }

  const handleStartEdit = (category: CategoryDTO) => {
    setEditingId(category.id)
    setEditingTitle(category.title)
  }

  const handleSaveEdit = () => {
    if (!editingId) return
    const trimmed = editingTitle.trim()
    if (!trimmed) return
    updateMutation.mutate({ id: editingId, title: trimmed })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const handleDelete = (id: string) => {
    if (confirm(t('deleteCategoryConfirmation'))) {
      deleteMutation.mutate(id)
    }
  }

  const categories = data?.categories ?? []

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t('categories')}
      </Typography>

      <Stack direction="row" spacing={SPACING.XS.PX} sx={{ mb: SPACING.MEDIUM.PX }}>
        <TextField
          size="small"
          placeholder={t('categoryName')}
          value={newCategoryTitle}
          onChange={(e) => setNewCategoryTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
          }}
          sx={{ flex: 1 }}
        />
        <Button
          size="small"
          variant="contained"
          onClick={handleAdd}
          disabled={!newCategoryTitle.trim() || addMutation.isPending}
        >
          {t('addCategory')}
        </Button>
      </Stack>

      <Stack spacing={SPACING.XS.PX}>
        {categories.map((category) => (
          <Stack
            key={category.id}
            direction="row"
            alignItems="center"
            spacing={SPACING.XS.PX}
            sx={{
              py: SPACING.XXXS.PX,
              px: SPACING.XS.PX,
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {editingId === category.id ? (
              <>
                <TextField
                  size="small"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit()
                    if (e.key === 'Escape') handleCancelEdit()
                  }}
                  sx={{ flex: 1 }}
                  autoFocus
                />
                <IconButton size="small" onClick={handleSaveEdit} disabled={!editingTitle.trim()}>
                  <Icon name="check" size={16} />
                </IconButton>
                <IconButton size="small" onClick={handleCancelEdit}>
                  <Icon name="close" size={16} />
                </IconButton>
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {category.title}
                </Typography>
                <IconButton size="small" onClick={() => handleStartEdit(category)}>
                  <Icon name="edit" size={16} />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(category.id)} color="error">
                  <Icon name="delete" size={16} />
                </IconButton>
              </>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

export default TabCategories
