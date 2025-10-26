import React from 'react'
import { useList } from '@refinedev/core'
import { 
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material'
import { Person, Business, CalendarToday } from '@mui/icons-material'

export const UsersList = () => {
  const usersQuery = useList({
    resource: "users",
  })

  const users = usersQuery.query.data?.data || []
  const isLoading = usersQuery.query.isLoading

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Users Management
      </Typography>

      <Grid container spacing={3}>
        {users.map((user: any) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: '#2196f3' }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Business sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2">
                      {user.businessCount} Business{user.businessCount !== 1 ? 'es' : ''}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarToday sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2">
                      {user.bookingCount} Booking{user.bookingCount !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>

                <Box mt={2}>
                  <Chip
                    label={`Joined ${new Date(user.createdAt).toLocaleDateString()}`}
                    size="small"
                    sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                  />
                </Box>

                {user.businesses && user.businesses.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                      Businesses:
                    </Typography>
                    {user.businesses.map((business: any) => (
                      <Chip
                        key={business.id}
                        label={business.name}
                        size="small"
                        sx={{ 
                          mr: 0.5, 
                          mt: 0.5,
                          backgroundColor: business.isActive ? '#e8f5e8' : '#ffebee',
                          color: business.isActive ? '#2e7d32' : '#c62828'
                        }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {users.length === 0 && (
        <Box textAlign="center" py={8}>
          <Person sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No users found
          </Typography>
        </Box>
      )}
    </Box>
  )
}
