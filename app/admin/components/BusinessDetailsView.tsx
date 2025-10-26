import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Stack,
  Avatar,
  Chip,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Save,
  Cancel,
  Business as BusinessIcon,
  Email,
  Phone,
  LocationOn,
  Web,
  AttachMoney,
  CalendarToday,
  People
} from '@mui/icons-material'

interface BusinessDetailsViewProps {
  business: any
  onBack: () => void
  onUpdate: (updatedBusiness: any) => void
}

export const BusinessDetailsView: React.FC<BusinessDetailsViewProps> = ({
  business,
  onBack,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(business)
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/businesses/${business.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        const updatedBusiness = await response.json()
        onUpdate(updatedBusiness)
        setIsEditing(false)
      } else {
        console.error('Failed to update business')
      }
    } catch (error) {
      console.error('Error updating business:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/businesses/${business.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onBack()
      } else {
        console.error('Failed to delete business')
      }
    } catch (error) {
      console.error('Error deleting business:', error)
    }
    setDeleteDialogOpen(false)
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
        <Avatar sx={{ bgcolor: business.isActive ? 'success.main' : 'error.main', width: 48, height: 48 }}>
          <BusinessIcon />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold">
            {business.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Business Details & Management
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => {
                  setIsEditing(false)
                  setEditData(business)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    value={isEditing ? editData.name : business.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={isEditing ? editData.email : business.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={isEditing ? editData.phone : business.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={isEditing ? editData.website : business.website || ''}
                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <Web sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={isEditing ? editData.address : business.address || ''}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={isEditing ? editData.description : business.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isEditing ? editData.isActive : business.isActive}
                        onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                        disabled={!isEditing}
                      />
                    }
                    label="Active Business"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics & Status */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Status Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status & Metrics
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip
                      label={business.isActive ? 'Active' : 'Inactive'}
                      color={business.isActive ? 'success' : 'error'}
                      variant="filled"
                    />
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                    <Typography variant="h5" color="success.main" fontWeight="bold">
                      £{business.totalRevenue?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Platform Fees</Typography>
                    <Typography variant="h6" color="warning.main" fontWeight="bold">
                      £{business.platformRevenue?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Services</Typography>
                    <Typography variant="h6" fontWeight="medium">
                      {business.serviceCount || 0}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Bookings</Typography>
                    <Typography variant="h6" fontWeight="medium">
                      {business.bookingCount || 0}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Staff Members</Typography>
                    <Typography variant="h6" fontWeight="medium">
                      {business.staffCount || 0}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Owner Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Owner Information
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {business.owner?.firstName} {business.owner?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {business.owner?.email}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Stripe Status */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Integration
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Stripe Status</Typography>
                    <Chip
                      label={business.stripeOnboarded ? 'Connected' : 'Not Connected'}
                      color={business.stripeOnboarded ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Box>
                  {business.stripeAccountId && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Account ID</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {business.stripeAccountId}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card sx={{ border: '1px solid', borderColor: 'error.main' }}>
              <CardContent>
                <Typography variant="h6" color="error" gutterBottom>
                  Danger Zone
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Permanently delete this business. This action cannot be undone.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  fullWidth
                >
                  Delete Business
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Business</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete <strong>{business.name}</strong>? 
            This will permanently remove all associated data including services, bookings, and payments.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
