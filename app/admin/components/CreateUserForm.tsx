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
  IconButton,
  Alert,
  Avatar
} from '@mui/material'
import {
  ArrowBack,
  Save,
  Person,
  Email,
  Badge
} from '@mui/icons-material'

interface CreateUserFormProps {
  onBack: () => void
  onSuccess: (newUser: any) => void
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onBack,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    clerkId: '' // This would normally be handled by Clerk
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newUser = await response.json()
        onSuccess(newUser)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create user')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
          <Person />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold">
            Create New User
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add a new user to the platform
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> This creates a user record in the database only. 
          For full authentication, users should sign up through the normal registration process.
        </Typography>
      </Alert>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Badge sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Badge sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      helperText="This email will be used for platform communications"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Clerk ID (Optional)"
                      value={formData.clerkId}
                      onChange={(e) => setFormData({ ...formData, clerkId: e.target.value })}
                      variant="outlined"
                      helperText="Leave empty unless linking to an existing Clerk user"
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </Grid>
                </Grid>

                <Box mt={4}>
                  <Stack spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Save />}
                      disabled={saving || !formData.firstName || !formData.lastName || !formData.email}
                      fullWidth
                    >
                      {saving ? 'Creating User...' : 'Create User'}
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
                </Box>
              </CardContent>
            </Card>

            {/* Preview Card */}
            {(formData.firstName || formData.lastName || formData.email) && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    User Preview
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      {formData.firstName?.[0]}{formData.lastName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {formData.firstName} {formData.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formData.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        New user • 0 businesses • 0 bookings
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}
