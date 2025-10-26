import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Stack,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
  Autocomplete,
  Avatar
} from '@mui/material'
import {
  ArrowBack,
  Save,
  Business as BusinessIcon,
  Email,
  Phone,
  LocationOn,
  Web,
  Person
} from '@mui/icons-material'

interface CreateBusinessFormProps {
  onBack: () => void
  onSuccess: (newBusiness: any) => void
  users: any[]
}

export const CreateBusinessForm: React.FC<CreateBusinessFormProps> = ({
  onBack,
  onSuccess,
  users
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    description: '',
    isActive: true,
    ownerId: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newBusiness = await response.json()
        onSuccess(newBusiness)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create business')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setSaving(false)
    }
  }

  const selectedOwner = users.find(user => user.id === formData.ownerId)

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
          <BusinessIcon />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold">
            Create New Business
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add a new business to the platform
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Business Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Business Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Web sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      variant="outlined"
                      multiline
                      rows={3}
                      placeholder="Describe the business, services offered, etc."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                      }
                      label="Active Business (can accept bookings)"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Owner Selection */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Business Owner
                </Typography>
                <Autocomplete
                  options={users}
                  getOptionLabel={(user) => `${user.firstName} ${user.lastName} (${user.email})`}
                  value={selectedOwner || null}
                  onChange={(_, newValue) => {
                    setFormData({ ...formData, ownerId: newValue?.id || '' })
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Owner"
                      required
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <Person sx={{ mr: 1, color: 'text.secondary' }} />
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  renderOption={(props, user) => (
                    <Box component="li" {...props}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                />

                {selectedOwner && (
                  <Box mt={2} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Owner:
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        {selectedOwner.firstName?.[0]}{selectedOwner.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedOwner.firstName} {selectedOwner.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedOwner.email}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {selectedOwner.businessCount} existing businesses
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                <Alert severity="info" sx={{ mt: 2 }}>
                  The selected user will become the owner of this business and will have full access to manage it.
                </Alert>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    disabled={saving || !formData.name || !formData.email || !formData.ownerId}
                    fullWidth
                  >
                    {saving ? 'Creating Business...' : 'Create Business'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={onBack}
                    disabled={saving}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}
