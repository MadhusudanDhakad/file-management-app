import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { Upload as UploadIcon, CloudDownload as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fileService } from '../api/api';

const Files = () => {
  const [files, setFiles] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fileService.getFiles();
        setFiles(response.data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };
    fetchFiles();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await fileService.uploadFile(file);
        const response = await fileService.getFiles();
        setFiles(response.data);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await fileService.downloadFile(fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await fileService.deleteFile(fileToDelete.id);
      setFiles(files.filter((file) => file.id !== fileToDelete.id));
      setOpenDeleteDialog(false);
      setSnackbar({
        open: true,
        message: 'File deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete file. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        File Management
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
        >
          Upload File
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
          />
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Filename</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>{file.original_filename}</TableCell>
                <TableCell>{file.file_type}</TableCell>
                <TableCell>{new Date(file.upload_date).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleDownload(file.id, file.original_filename)}
                    color="primary"
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(file)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{fileToDelete?.original_filename}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Files;