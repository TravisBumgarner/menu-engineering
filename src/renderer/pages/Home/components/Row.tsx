import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { type RecipeDTO } from "../../../../shared/types";

function RecipeRow(props: {
  row: RecipeDTO;
  isItemSelected: boolean;
  labelId: string;
  onClick: (event: React.MouseEvent<unknown>, id: string) => void;
}) {
  const { row, isItemSelected, labelId, onClick } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow
        hover
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={row.id}
        selected={isItemSelected}
        sx={{ "& > *": { borderBottom: "unset" } }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? "🔼" : "🔽"}
          </IconButton>
        </TableCell>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={isItemSelected}
            onClick={(event) => onClick(event, row.id)}
            inputProps={{
              "aria-labelledby": labelId,
            }}
          />
        </TableCell>
        <TableCell component="th" id={labelId} scope="row" padding="none">
          {row.title}
        </TableCell>
        <TableCell align="right">{row.produces}</TableCell>
        <TableCell align="left">{row.units}</TableCell>
        <TableCell align="left">
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor:
                row.status === "PUBLISHED"
                  ? "success.light"
                  : row.status === "DRAFT"
                    ? "warning.light"
                    : "error.light",
              color:
                row.status === "PUBLISHED"
                  ? "success.contrastText"
                  : row.status === "DRAFT"
                    ? "warning.contrastText"
                    : "error.contrastText",
            }}
          >
            {row.status.toUpperCase()}
          </Typography>
        </TableCell>
        <TableCell align="left">{row.showInMenu ? "✓" : "✗"}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Recipe Details
              </Typography>
              <MuiTable size="small" aria-label="recipe details">
                <TableBody>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: "bold" }}
                    >
                      ID
                    </TableCell>
                    <TableCell>{row.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: "bold" }}
                    >
                      Created
                    </TableCell>
                    <TableCell>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: "bold" }}
                    >
                      Updated
                    </TableCell>
                    <TableCell>
                      {new Date(row.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: "bold" }}
                    >
                      Notes
                    </TableCell>
                    <TableCell>{row.notes || <em>No notes</em>}</TableCell>
                  </TableRow>
                </TableBody>
              </MuiTable>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default RecipeRow;
