import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { deleteDrug } from "../../../redux/slices/drugManageSlice";
import { useAppDispatch } from "../../../redux/store";

interface DeleteModalProps {
  openDelete: boolean;
  handleClose: () => void;
  drug: {
    id: number;
    name: string;
  };
}

const DeleteDrugModal: React.FC<DeleteModalProps> = ({
  openDelete,
  handleClose,
  drug,
}) => {
  const dispatch = useAppDispatch();

  const handleDelete = () => {
    dispatch(deleteDrug(drug.id));
    handleClose();
  };

  return (
    <>
      <Dialog open={openDelete} onClose={handleClose} maxWidth="sm">
        <div className="p-6">
          <DialogTitle className="text-lg font-semibold mb-4">
            Confirm Delete Drug
          </DialogTitle>
          <DialogContent>
            <DialogContentText className="text-gray-600">
              Are you sure you want to delete drug "{drug.name}"? This action
              cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions className="mt-6 flex justify-end gap-2">
            <Button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-100 rounded"
            >
              Delete
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </>
  );
};

export default DeleteDrugModal;
