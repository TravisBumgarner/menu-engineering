import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { CHANNEL } from "../../../../shared/messages.types";
import { NewRecipeDTO, RECIPE_STATUS } from "../../../../shared/types";
import ipcMessenger from "../../../ipcMessenger";
import { activeModalSignal } from "../../../signals";
import { MODAL_ID } from "../Modal.consts";
import DefaultModal from "./DefaultModal";

export interface AddRecipeModalProps {
  id: typeof MODAL_ID.ADD_RECIPE_MODAL;
}

const AddRecipeModal = ({ id }: AddRecipeModalProps) => {
  const [formData, setFormData] = useState<NewRecipeDTO>({
    title: "",
    produces: 1,
    units: "",
    status: RECIPE_STATUS.DRAFT,
    notes: "",
    showInMenu: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await ipcMessenger.invoke(CHANNEL.DB.ADD_RECIPE, {
      payload: formData,
    });

    if (result.success) {
      alert("Recipe added successfully!");
      activeModalSignal.value = null;
    } else {
      alert("Failed to add recipe.");
    }
  };

  const handleInputChange =
    (field: keyof NewRecipeDTO) =>
    (
      e: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleCheckboxChange =
    (field: keyof NewRecipeDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.checked,
      }));
    };

  return (
    <DefaultModal>
      <Typography variant="h5" component="h2" gutterBottom>
        Add New Recipe
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            size="small"
            label="Title"
            value={formData.title}
            onChange={handleInputChange("title")}
            required
            fullWidth
          />

          <TextField
            size="small"
            label="Produces"
            type="number"
            value={formData.produces}
            onChange={handleInputChange("produces")}
            required
            fullWidth
          />

          <TextField
            size="small"
            label="Units"
            value={formData.units}
            onChange={handleInputChange("units")}
            required
            fullWidth
            placeholder="e.g. servings, portions, pieces"
          />

          <FormControl size="small" fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={handleInputChange("status")}
              label="Status"
            >
              <MenuItem value={RECIPE_STATUS.DRAFT}>Draft</MenuItem>
              <MenuItem value={RECIPE_STATUS.PUBLISHED}>Published</MenuItem>
              <MenuItem value={RECIPE_STATUS.ARCHIVED}>Archived</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Notes"
            value={formData.notes}
            onChange={handleInputChange("notes")}
            multiline
            rows={2}
            fullWidth
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.showInMenu}
                onChange={handleCheckboxChange("showInMenu")}
              />
            }
            label="Show in Menu"
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" type="button">
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              Add Recipe
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  );
};

export default AddRecipeModal;
