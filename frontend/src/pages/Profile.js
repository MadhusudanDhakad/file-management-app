import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { profileService, addressService } from '../api/api';

const Profile = () => {
  const [profile, setProfile] = useState({
    email: '',
    username: '',
    phone_number: '',
    addresses: [],
  });
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileService.getProfile();
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const profileFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: profile.username || '',
      phone_number: profile.phone_number || '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Required'),
      phone_number: Yup.string().matches(
        /^\+?1?\d{9,15}$/,
        'Phone number must be entered in the format: +999999999'
      ),
    }),
    onSubmit: async (values) => {
      try {
        const response = await profileService.updateProfile(values);
        setProfile({ ...profile, ...response.data });
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    },
  });

  const addressFormik = useFormik({
    initialValues: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_default: false,
    },
    validationSchema: Yup.object({
      street: Yup.string().required('Required'),
      city: Yup.string().required('Required'),
      state: Yup.string().required('Required'),
      postal_code: Yup.string().required('Required'),
      country: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      try {
        if (editingAddress) {
          const response = await addressService.updateAddress(editingAddress.id, values);
          setProfile({
            ...profile,
            addresses: profile.addresses.map((addr) =>
              addr.id === editingAddress.id ? response.data : addr
            ),
          });
        } else {
          const response = await addressService.createAddress(values);
          setProfile({
            ...profile,
            addresses: [...profile.addresses, response.data],
          });
        }
        setOpenAddressDialog(false);
        setEditingAddress(null);
        addressFormik.resetForm();
      } catch (error) {
        console.error('Error saving address:', error);
      }
    },
  });

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    addressFormik.setValues({
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    });
    setOpenAddressDialog(true);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await addressService.deleteAddress(id);
      setProfile({
        ...profile,
        addresses: profile.addresses.filter((addr) => addr.id !== id),
      });
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <form onSubmit={profileFormik.handleSubmit}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  value={profile.email || ''}
                  disabled
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  value={profileFormik.values.username}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.username && Boolean(profileFormik.errors.username)}
                  helperText={profileFormik.touched.username && profileFormik.errors.username}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="phone_number"
                  label="Phone Number"
                  name="phone_number"
                  value={profileFormik.values.phone_number}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.phone_number && Boolean(profileFormik.errors.phone_number)}
                  helperText={profileFormik.touched.phone_number && profileFormik.errors.phone_number}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Addresses
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAddressDialog(true)}
                >
                  Add Address
                </Button>
              </Box>
              <List>
                {profile.addresses.map((address) => (
                  <React.Fragment key={address.id}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton onClick={() => handleEditAddress(address)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteAddress(address.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={`${address.street}, ${address.city}`}
                        secondary={`${address.state}, ${address.postal_code}, ${address.country} ${
                          address.is_default ? '(Default)' : ''
                        }`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {profile.addresses.length === 0 && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    No addresses added yet.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={openAddressDialog} onClose={() => setOpenAddressDialog(false)}>
        <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        <DialogContent>
          <form onSubmit={addressFormik.handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              id="street"
              label="Street"
              name="street"
              value={addressFormik.values.street}
              onChange={addressFormik.handleChange}
              error={addressFormik.touched.street && Boolean(addressFormik.errors.street)}
              helperText={addressFormik.touched.street && addressFormik.errors.street}
            />
            <TextField
              margin="normal"
              fullWidth
              id="city"
              label="City"
              name="city"
              value={addressFormik.values.city}
              onChange={addressFormik.handleChange}
              error={addressFormik.touched.city && Boolean(addressFormik.errors.city)}
              helperText={addressFormik.touched.city && addressFormik.errors.city}
            />
            <TextField
              margin="normal"
              fullWidth
              id="state"
              label="State/Province"
              name="state"
              value={addressFormik.values.state}
              onChange={addressFormik.handleChange}
              error={addressFormik.touched.state && Boolean(addressFormik.errors.state)}
              helperText={addressFormik.touched.state && addressFormik.errors.state}
            />
            <TextField
              margin="normal"
              fullWidth
              id="postal_code"
              label="Postal Code"
              name="postal_code"
              value={addressFormik.values.postal_code}
              onChange={addressFormik.handleChange}
              error={addressFormik.touched.postal_code && Boolean(addressFormik.errors.postal_code)}
              helperText={addressFormik.touched.postal_code && addressFormik.errors.postal_code}
            />
            <TextField
              margin="normal"
              fullWidth
              id="country"
              label="Country"
              name="country"
              value={addressFormik.values.country}
              onChange={addressFormik.handleChange}
              error={addressFormik.touched.country && Boolean(addressFormik.errors.country)}
              helperText={addressFormik.touched.country && addressFormik.errors.country}
            />
            <Box sx={{ mt: 2 }}>
              <input
                type="checkbox"
                id="is_default"
                name="is_default"
                checked={addressFormik.values.is_default}
                onChange={addressFormik.handleChange}
              />
              <label htmlFor="is_default" style={{ marginLeft: '8px' }}>
                Set as default address
              </label>
            </Box>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddressDialog(false)}>Cancel</Button>
          <Button onClick={addressFormik.handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;