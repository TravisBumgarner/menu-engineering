// import {
//   Box,
//   Button,
//   FormControl,
//   MenuItem,
//   Select,
//   TableCell,
//   TableRow,
//   TextField,
// } from '@mui/material'
// import { useMutation, useQueryClient } from '@tanstack/react-query'
// import React, { useState } from 'react'
// import { CHANNEL } from '../../../../../../shared/messages.types'
// import {
//   NewIngredientDTO,
//   RecipeDTO,
// } from '../../../../../../shared/recipe.types'
// import { ALL_UNITS, WEIGHT_UNIT } from '../../../../../../shared/units.types'
// import { QUERY_KEYS } from '../../../../../consts'
// import { useAppTranslation } from '../../../../../hooks/useTranslation'
// import ipcMessenger from '../../../../../ipcMessenger'
// import { SPACING } from '../../../../../styles/consts'
// import { ADD_ROW_HEIGHT } from './consts'

// interface AddIngredientRowProps {
//   recipe: RecipeDTO
//   onCancel: () => void
// }

// const AddIngredientRow: React.FC<AddIngredientRowProps> = ({
//   recipe,
//   onCancel,
// }) => {
//   const { t } = useAppTranslation()
//   const queryClient = useQueryClient()

//   const [formData, setFormData] = useState<NewIngredientDTO>({
//     title: '',
//     quantity: 0,
//     units: WEIGHT_UNIT.grams,
//     notes: '',
//     cost: 0,
//   })

//   const addIngredientMutation = useMutation({
//     mutationFn: (ingredientData: NewIngredientDTO) =>
//       ipcMessenger.invoke(CHANNEL.DB.ADD_INGREDIENT, {
//         payload: {
//           newIngredient: ingredientData,
//           recipeId: recipe.id,
//           units: recipe.units, // TOdo - this doesn't have to be linked to parent.
//         },
//       }),
//     onSuccess: result => {
//       if (result.success) {
//         queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INGREDIENTS] })
//         queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
//         onCancel() // Close the form
//       } else {
//         alert(t('failedToAddIngredient'))
//       }
//     },
//     onError: () => {
//       alert(t('errorAddingIngredient'))
//     },
//   })

//   const handleSubmit = () => {
//     addIngredientMutation.mutate(formData)
//   }

//   const handleInputChange =
//     (field: keyof NewIngredientDTO) =>
//     (
//       e: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } },
//     ) => {
//       const value =
//         field === 'quantity' || field === 'cost'
//           ? Number(e.target.value)
//           : e.target.value
//       setFormData(prev => ({
//         ...prev,
//         [field]: value,
//       }))
//     }

//   const preventSubmit =
//     addIngredientMutation.isPending ||
//     !formData.title.trim() ||
//     formData.quantity <= 0 ||
//     !formData.units.trim()

//   return (
//     <TableRow sx={{ height: ADD_ROW_HEIGHT }}>
//       <TableCell colSpan={8}>
//         <Box
//           sx={{
//             display: 'flex',
//             gap: SPACING.MEDIUM.PX,
//             alignItems: 'center',
//             width: '100%',
//           }}
//         >
//           <TextField
//             size="small"
//             label={t('ingredientName')}
//             value={formData.title}
//             onChange={handleInputChange('title')}
//             required
//             sx={{ flex: 2 }}
//             variant="outlined"
//           />

//           <TextField
//             size="small"
//             label={t('quantity')}
//             type="number"
//             value={formData.quantity}
//             onChange={handleInputChange('quantity')}
//             required
//             sx={{ width: 100 }}
//             variant="outlined"
//             inputProps={{ min: 0, step: 'any' }}
//           />

//           <FormControl size="small" sx={{ width: 120 }} required>
//             <Select
//               value={formData.units}
//               onChange={e =>
//                 handleInputChange('units')(
//                   e as React.ChangeEvent<HTMLInputElement>,
//                 )
//               }
//               displayEmpty
//               variant="outlined"
//             >
//               <MenuItem value="" disabled>
//                 {t('units')}
//               </MenuItem>
//               {Object.entries(ALL_UNITS).map(([key, value]) => (
//                 <MenuItem key={key} value={value}>
//                   {t(value as keyof typeof ALL_UNITS)}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <TextField
//             size="small"
//             label={`${t('cost')} ($)`}
//             type="number"
//             value={formData.cost}
//             onChange={handleInputChange('cost')}
//             required
//             sx={{ width: 120 }}
//             variant="outlined"
//             inputProps={{ min: 0, step: 0.01 }}
//           />

//           <TextField
//             size="small"
//             label={t('notes')}
//             value={formData.notes}
//             onChange={handleInputChange('notes')}
//             sx={{ flex: 1 }}
//             variant="outlined"
//             multiline
//             rows={1}
//           />

//           <Box sx={{ display: 'flex', gap: 1 }}>
//             <Button onClick={onCancel} variant="outlined" size="small">
//               {t('cancel')}
//             </Button>
//             <Button
//               variant="contained"
//               size="small"
//               onClick={handleSubmit}
//               disabled={preventSubmit}
//             >
//               {addIngredientMutation.isPending ? t('saving') : t('save')}
//             </Button>
//           </Box>
//         </Box>
//       </TableCell>
//     </TableRow>
//   )
// }

// export default AddIngredientRow
