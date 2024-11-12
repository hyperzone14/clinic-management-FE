import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { deleteUser } from "../../../redux/slices/userManageSlice";

interface DeleteModalProps {
  openDelete: boolean;
  handleClose: () => void;
  user: {
    id: number;
    fullName: string;
  };
}

const DeleteUserModal: React.FC<DeleteModalProps> = ({
  openDelete,
  handleClose,
  user,
}) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteUser(user.id));
    handleClose();
  };

  return (
    <Dialog open={openDelete} onClose={handleClose} maxWidth="sm">
      <div className="p-6">
        <DialogTitle className="text-lg font-semibold mb-4">
          Confirm Delete User
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-600">
            Are you sure you want to delete user "{user.fullName}"? This action
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
            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
          >
            Delete
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default DeleteUserModal;
