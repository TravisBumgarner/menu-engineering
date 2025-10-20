import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { MODAL_ID } from "../sharedComponents/Modal/Modal.consts";
import { activeModalSignal } from "../signals";

const Home = () => {
  const handleOpenAddRecipeModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_RECIPE_MODAL,
    };
  };

  return (
    <Box>
      <Button onClick={handleOpenAddRecipeModal}>Add Recipe</Button>
    </Box>
  );
};

export default Home;
