import React from 'react'
import { useList } from '@refinedev/core'
import { 
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress
} from '@mui/material'
import { 
  Person, 
  Business, 
  CalendarToday, 
  Payment,
  Timeline
} from '@mui/icons-material'

export const ActivityList = () => {
  const activityQuery = useList({
    resource: "activity",
  })

  const activities = activityQuery.query.data?.data || []
  const isLoading = activityQuery.query.isLoading

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return <Person />
      case 'business_created': return <Business />
      case 'booking_made': return <CalendarToday />
      case 'payment_processed': return <Payment />
      default: return <Timeline />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_signup': return '#4caf50'
      case 'business_created': return '#2196f3'
      case 'booking_made': return '#9c27b0'
      case 'payment_processed': return '#ff9800'
      default: return '#757575'
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'user_signup': return 'User Signup'
      case 'business_created': return 'Business Created'
      case 'booking_made': return 'Booking Made'
      case 'payment_processed': return 'Payment Processed'
      default: return 'Activity'
    }
  }

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
        Platform Activity
      </Typography>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <List sx={{ width: '100%' }}>
            {activities.map((activity: any, index: number) => (
              <ListItem 
                key={activity.id}
                sx={{ 
                  borderBottom: index < activities.length - 1 ? '1px solid #f0f0f0' : 'none',
                  py: 2
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {activity.description}
                      </Typography>
                      <Chip
                        label={getActivityLabel(activity.type)}
                        size="small"
                        sx={{
                          backgroundColor: getActivityColor(activity.type) + '20',
                          color: getActivityColor(activity.type),
                          fontSize: '11px'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" color="textSecondary">
                        {new Date(activity.timestamp).toLocaleString()}
                      </Typography>
                      {activity.amount && (
                        <Chip
                          label={`£${activity.amount.toFixed(2)}`}
                          size="small"
                          sx={{ 
                            backgroundColor: '#4caf50', 
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {activities.length === 0 && (
        <Box textAlign="center" py={8}>
          <Timeline sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No recent activity
          </Typography>
        </Box>
      )}
    </Box>
  )
}
