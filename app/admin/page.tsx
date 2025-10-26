'use client'

import React from 'react'
import { useAuth, useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  ThemeProvider, 
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Paper,
  Stack,
  LinearProgress,
  Fade,
  Skeleton,
  useMediaQuery
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  TrendingUp,
  AttachMoney,
  CalendarToday,
  Notifications,
  Settings,
  Menu as MenuIcon,
  Close as CloseIcon,
  Logout,
  Security,
  Analytics,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// Import admin components
import { BusinessDetailsView } from './components/BusinessDetailsView'
import { CreateBusinessForm } from './components/CreateBusinessForm'
import { CreateUserForm } from './components/CreateUserForm'

const ADMIN_EMAIL = 'kristiyan@tsvweb.com'

// Premium MUI Theme
const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid #e2e8f0',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
  },
})

// Premium Admin Dashboard Component
function PremiumAdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [businesses, setBusiness] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('dashboard')
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMediaQuery(adminTheme.breakpoints.down('md'))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes, usersRes, businessRes, analyticsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/activity'),
          fetch('/api/admin/users'),
          fetch('/api/admin/businesses'),
          fetch('/api/admin/analytics')
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json()
          setActivity(activityData.activities || [])
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData.users || [])
        }

        if (businessRes.ok) {
          const businessData = await businessRes.json()
          setBusiness(businessData.businesses || [])
        }

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json()
          setAnalytics(analyticsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'users', label: 'Users', icon: <PeopleIcon /> },
    { id: 'businesses', label: 'Businesses', icon: <BusinessIcon /> },
    { id: 'activity', label: 'Activity', icon: <TimelineIcon /> },
    { id: 'analytics', label: 'Analytics', icon: <Analytics /> },
    { id: 'settings', label: 'Settings', icon: <Settings /> },
  ]

  const getPageTitle = () => {
    switch (selectedTab) {
      case 'business-details': return `Business: ${selectedBusiness?.name || 'Details'}`
      case 'user-details': return `User: ${selectedUser?.firstName || 'Details'}`
      case 'create-business': return 'Create Business'
      case 'create-user': return 'Create User'
      default: return sidebarItems.find(item => item.id === selectedTab)?.label || 'Dashboard'
    }
  }

  const StatCard = ({ title, value, change, icon, color }: any) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Stack>
        {change && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2" color="success.main" fontWeight="medium">
              {change}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              vs last month
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  )

  const ActivityItem = ({ activity }: any) => {
    const getIcon = (type: string) => {
      switch (type) {
        case 'user_signup': return <PeopleIcon sx={{ fontSize: 20 }} />
        case 'business_created': return <BusinessIcon sx={{ fontSize: 20 }} />
        case 'booking_made': return <CalendarToday sx={{ fontSize: 20 }} />
        case 'payment_processed': return <AttachMoney sx={{ fontSize: 20 }} />
        default: return <Info sx={{ fontSize: 20 }} />
      }
    }

    const getColor = (type: string) => {
      switch (type) {
        case 'user_signup': return 'success.main'
        case 'business_created': return 'primary.main'
        case 'booking_made': return 'secondary.main'
        case 'payment_processed': return 'warning.main'
        default: return 'text.secondary'
      }
    }

    return (
      <Stack direction="row" spacing={2} alignItems="center" py={1.5}>
        <Avatar sx={{ bgcolor: getColor(activity.type) + '20', width: 40, height: 40 }}>
          {getIcon(activity.type)}
        </Avatar>
        <Box flex={1}>
          <Typography variant="body1" fontWeight="medium">
            {activity.description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(activity.timestamp).toLocaleString()}
          </Typography>
        </Box>
        {activity.amount && (
          <Chip
            label={`£${activity.amount.toFixed(2)}`}
            size="small"
            color="success"
            variant="outlined"
          />
        )}
      </Stack>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" height={40} />
                  <Skeleton variant="text" width="80%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )
    }

    switch (selectedTab) {
      case 'dashboard':
        return (
          <Stack spacing={3}>
            {/* Stats Cards */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Users"
                  value={stats?.totalUsers || 0}
                  change={`+${stats?.recentSignups || 0} this month`}
                  icon={<PeopleIcon />}
                  color="primary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Businesses"
                  value={stats?.totalBusinesses || 0}
                  change={`${stats?.activeUsers || 0} active`}
                  icon={<BusinessIcon />}
                  color="success.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Bookings"
                  value={stats?.totalBookings || 0}
                  change={`+${stats?.monthlyGrowth || 0}% growth`}
                  icon={<CalendarToday />}
                  color="secondary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Platform Revenue"
                  value={`£${(stats?.platformRevenue || 0).toFixed(2)}`}
                  change={`£${(stats?.totalRevenue || 0).toFixed(2)} total`}
                  icon={<AttachMoney />}
                  color="warning.main"
                />
              </Grid>
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Revenue Trends (Last 30 Days)
                    </Typography>
                    <Box sx={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <AreaChart data={analytics?.revenueData || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            formatter={(value: any, name: string) => [
                              `£${Number(value).toFixed(2)}`,
                              name === 'revenue' ? 'Total Revenue' : 'Platform Fee'
                            ]}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stackId="1"
                            stroke="#1976d2"
                            fill="#1976d2"
                            fillOpacity={0.6}
                            name="Total Revenue"
                          />
                          <Area
                            type="monotone"
                            dataKey="platformFee"
                            stackId="2"
                            stroke="#ff9800"
                            fill="#ff9800"
                            fillOpacity={0.8}
                            name="Platform Fee"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Business Status Distribution
                    </Typography>
                    <Box sx={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={analytics?.businessStatusData || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {(analytics?.businessStatusData || []).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any, name: string) => [value, name]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* User Signups & Booking Trends */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      User Signups (Last 30 Days)
                    </Typography>
                    <Box sx={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <LineChart data={analytics?.userSignupData || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            formatter={(value: any) => [value, 'New Users']}
                          />
                          <Line
                            type="monotone"
                            dataKey="users"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Weekly Booking Trends
                    </Typography>
                    <Box sx={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <BarChart data={analytics?.bookingTrends || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: any) => [value, 'Bookings']} />
                          <Bar
                            dataKey="bookings"
                            fill="#9c27b0"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Top Businesses & Recent Activity */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Businesses by Revenue
                    </Typography>
                    <Stack spacing={2}>
                      {(analytics?.topBusinesses || []).slice(0, 5).map((business: any, index: number) => (
                        <Box key={business.name} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                {index + 1}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  {business.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {business.bookings} bookings
                                </Typography>
                              </Box>
                            </Stack>
                            <Typography variant="h6" color="success.main" fontWeight="bold">
                              £{business.revenue.toFixed(2)}
                            </Typography>
                          </Stack>
                        </Box>
                      ))}
                      {(!analytics?.topBusinesses || analytics.topBusinesses.length === 0) && (
                        <Typography color="text.secondary" textAlign="center" py={4}>
                          No business data available
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity
                    </Typography>
                    <Stack spacing={1} divider={<Divider />} sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {activity.slice(0, 8).map((item) => (
                        <ActivityItem key={item.id} activity={item} />
                      ))}
                      {activity.length === 0 && (
                        <Typography color="text.secondary" textAlign="center" py={4}>
                          No recent activity
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* System Status */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Health Status
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { 
                      name: 'Database', 
                      status: stats ? 'Operational' : 'Connection Issues', 
                      color: stats ? 'success' : 'error', 
                      description: stats ? 'All queries responding normally' : 'Database connection problems detected'
                    },
                    { name: 'Stripe Payments', status: 'Operational', color: 'success', description: 'Payment processing active' },
                    { name: 'Authentication', status: 'Operational', color: 'success', description: 'Clerk auth services running' },
                    { name: 'API Endpoints', status: 'Monitoring', color: 'warning', description: 'Performance monitoring active' }
                  ].map((service) => (
                    <Grid item xs={12} sm={6} md={3} key={service.name}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        {service.color === 'success' ? (
                          <CheckCircle sx={{ fontSize: 32, color: `${service.color}.main`, mb: 1 }} />
                        ) : service.color === 'error' ? (
                          <ErrorIcon sx={{ fontSize: 32, color: `${service.color}.main`, mb: 1 }} />
                        ) : (
                          <Warning sx={{ fontSize: 32, color: `${service.color}.main`, mb: 1 }} />
                        )}
                        <Typography variant="h6" gutterBottom>
                          {service.name}
                        </Typography>
                        <Chip
                          label={service.status}
                          size="small"
                          color={service.color as any}
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {service.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        )

      case 'users':
        return (
          <Stack spacing={3}>
            {/* Users Management Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="bold">
                User Management ({users.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => setSelectedTab('create-user')}
                sx={{ borderRadius: 2 }}
              >
                Create User
              </Button>
            </Box>

            {/* Users Overview Stats */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Users
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {users.length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        <PeopleIcon />
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Business Owners
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {users.filter(user => user.businessCount > 0).length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                        <BusinessIcon />
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Active Users
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {users.filter(user => user.bookingCount > 0 || user.businessCount > 0).length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                        <TrendingUp />
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          New This Month
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {users.filter(user => {
                            const userDate = new Date(user.createdAt)
                            const now = new Date()
                            return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
                          }).length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                        <CalendarToday />
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Users List */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  All Users ({users.length})
                </Typography>
                <Grid container spacing={3}>
                  {users.length > 0 ? users.map((user) => (
                    <Grid item xs={12} sm={6} lg={4} key={user.id}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                            <Avatar 
                              sx={{ 
                                bgcolor: user.businessCount > 0 ? 'success.main' : 'primary.main',
                                width: 48,
                                height: 48
                              }}
                            >
                              {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="h6" noWrap>
                                {user.firstName || 'Unknown'} {user.lastName || 'User'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {user.email}
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Account Details
                              </Typography>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">User ID:</Typography>
                                <Typography variant="body2" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                                  {user.id.slice(-8)}
                                </Typography>
                              </Stack>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Joined:</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </Typography>
                              </Stack>
                            </Box>

                            <Divider />

                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Activity Summary
                              </Typography>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Businesses:</Typography>
                                <Chip
                                  label={user.businessCount}
                                  size="small"
                                  color={user.businessCount > 0 ? 'success' : 'default'}
                                  variant="outlined"
                                />
                              </Stack>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Bookings:</Typography>
                                <Chip
                                  label={user.bookingCount}
                                  size="small"
                                  color={user.bookingCount > 0 ? 'primary' : 'default'}
                                  variant="outlined"
                                />
                              </Stack>
                            </Box>

                            {user.businesses && user.businesses.length > 0 && (
                              <>
                                <Divider />
                                <Box>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Businesses Owned
                                  </Typography>
                                  <Stack spacing={1}>
                                    {user.businesses.slice(0, 2).map((business: any) => (
                                      <Stack key={business.id} direction="row" alignItems="center" spacing={1}>
                                        <Box
                                          sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: business.isActive ? 'success.main' : 'error.main'
                                          }}
                                        />
                                        <Typography variant="body2" noWrap flex={1}>
                                          {business.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {business.isActive ? 'Active' : 'Inactive'}
                                        </Typography>
                                      </Stack>
                                    ))}
                                    {user.businesses.length > 2 && (
                                      <Typography variant="caption" color="text.secondary">
                                        +{user.businesses.length - 2} more
                                      </Typography>
                                    )}
                                  </Stack>
                                </Box>
                              </>
                            )}

                            <Box>
                              <Stack direction="row" spacing={1}>
                                <Chip
                                  label={user.businessCount > 0 ? 'Business Owner' : 'Customer'}
                                  size="small"
                                  color={user.businessCount > 0 ? 'success' : 'primary'}
                                  variant="filled"
                                />
                                {user.bookingCount > 0 && (
                                  <Chip
                                    label="Active"
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  )) : (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 6, textAlign: 'center' }}>
                        <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Users Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          No users have registered on the platform yet.
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        )

      case 'businesses':
        return (
          <Stack spacing={3}>
            {/* Business Management Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="bold">
                Business Management ({businesses.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<BusinessIcon />}
                onClick={() => setSelectedTab('create-business')}
                sx={{ borderRadius: 2 }}
              >
                Create Business
              </Button>
            </Box>

            {/* Business Stats Overview */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {businesses.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Businesses
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {businesses.filter(b => b.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Businesses
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    £{businesses.reduce((sum, b) => sum + (b.totalRevenue || 0), 0).toFixed(0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary.main" fontWeight="bold">
                    £{businesses.reduce((sum, b) => sum + (b.platformRevenue || 0), 0).toFixed(0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Platform Fees
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Business List */}
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  {businesses.length > 0 ? businesses.map((business) => (
                    <Grid item xs={12} md={6} lg={4} key={business.id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => {
                          setSelectedBusiness(business)
                          setSelectedTab('business-details')
                        }}
                      >
                        <CardContent>
                          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                            <Avatar sx={{ bgcolor: business.isActive ? 'success.main' : 'error.main', width: 48, height: 48 }}>
                              <BusinessIcon />
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="h6" noWrap>{business.name}</Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {business.email}
                              </Typography>
                            </Box>
                            <Chip
                              label={business.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              color={business.isActive ? 'success' : 'error'}
                              variant="filled"
                            />
                          </Stack>

                          {business.description && (
                            <Typography variant="body2" color="text.secondary" mb={2} sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {business.description}
                            </Typography>
                          )}

                          <Stack spacing={1} mb={2}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Revenue:</Typography>
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                £{business.totalRevenue?.toFixed(2) || '0.00'}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Platform Fee:</Typography>
                              <Typography variant="body2" fontWeight="bold" color="warning.main">
                                £{business.platformRevenue?.toFixed(2) || '0.00'}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Services:</Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {business.serviceCount}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Bookings:</Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {business.bookingCount}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                            {business.stripeOnboarded && (
                              <Chip label="Stripe Connected" size="small" color="primary" variant="outlined" />
                            )}
                            <Chip
                              label={`Owner: ${business.owner?.firstName} ${business.owner?.lastName}`}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>

                          {business.address && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              📍 {business.address}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )) : (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 6, textAlign: 'center' }}>
                        <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Businesses Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                          No businesses have been created yet.
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<BusinessIcon />}
                          onClick={() => setSelectedTab('create-business')}
                        >
                          Create First Business
                        </Button>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        )

      case 'activity':
        return (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Platform Activity Feed
              </Typography>
              <Stack spacing={2} divider={<Divider />}>
                {activity.map((item) => (
                  <ActivityItem key={item.id} activity={item} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        )

      case 'business-details':
        return selectedBusiness ? (
          <BusinessDetailsView 
            business={selectedBusiness} 
            onBack={() => setSelectedTab('businesses')}
            onUpdate={(updatedBusiness) => {
              setBusiness(prev => prev.map(b => b.id === updatedBusiness.id ? updatedBusiness : b))
              setSelectedBusiness(updatedBusiness)
            }}
          />
        ) : (
          <Card>
            <CardContent>
              <Typography>No business selected</Typography>
              <Button onClick={() => setSelectedTab('businesses')}>Back to Businesses</Button>
            </CardContent>
          </Card>
        )

      case 'create-business':
        return (
          <CreateBusinessForm 
            onBack={() => setSelectedTab('businesses')}
            onSuccess={(newBusiness) => {
              setBusiness(prev => [...prev, newBusiness])
              setSelectedTab('businesses')
            }}
            users={users}
          />
        )

      case 'create-user':
        return (
          <CreateUserForm 
            onBack={() => setSelectedTab('users')}
            onSuccess={(newUser) => {
              setUsers(prev => [...prev, newUser])
              setSelectedTab('users')
            }}
          />
        )

      default:
        return (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
              </Typography>
              <Typography color="text.secondary">
                This section is coming soon...
              </Typography>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Security />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                GlamBooking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admin Panel
              </Typography>
            </Box>
          </Stack>
        </Box>

        <List sx={{ px: 2, py: 1 }}>
          {sidebarItems.map((item) => (
            <ListItemButton
              key={item.id}
              selected={selectedTab === item.id}
              onClick={() => setSelectedTab(item.id)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setSidebarOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" color="text.primary" sx={{ flexGrow: 1 }}>
              {getPageTitle()}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton>
                <Notifications />
              </IconButton>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                A
              </Avatar>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Container maxWidth="xl" sx={{ py: 3, flexGrow: 1 }}>
          <Fade in={!loading}>
            <Box>
              {renderContent()}
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  )
}

export default function AdminPage() {
  const { userId, isLoaded } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    // Wait for both auth and user data to be loaded
    if (isLoaded && userLoaded) {
      if (!userId) {
        router.push('/sign-in')
        return
      }

      // Wait a bit longer for user data to be fully loaded
      const checkAccess = () => {
        if (user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL) {
          setLoading(false)
          setAccessDenied(false)
        } else if (user?.primaryEmailAddress?.emailAddress) {
          // User email is loaded but not admin
          setAccessDenied(true)
          setLoading(false)
        } else {
          // User email not loaded yet, wait a bit more
          setTimeout(checkAccess, 500)
        }
      }

      checkAccess()
    }
  }, [isLoaded, userLoaded, userId, user, router])

  if (accessDenied) {
    return (
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Card sx={{ maxWidth: 400, textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Avatar sx={{ bgcolor: 'error.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                <Security sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h5" color="error" gutterBottom>
                Access Denied
              </Typography>
              <Typography color="text.secondary" paragraph>
                You don't have permission to access the admin dashboard.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/')}
                startIcon={<DashboardIcon />}
              >
                Go Home
              </Button>
            </CardContent>
          </Card>
        </Box>
      </ThemeProvider>
    )
  }

  if (loading) {
    return (
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <LinearProgress sx={{ width: 200 }} />
            <Typography color="text.secondary">
              Loading admin dashboard...
            </Typography>
          </Stack>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1300 }}>
        <Button
          variant="contained"
          color="error"
          onClick={() => signOut(() => router.push('/'))}
          startIcon={<Logout />}
          size="small"
        >
          Sign Out
        </Button>
      </Box>
      <PremiumAdminDashboard />
    </ThemeProvider>
  )
}
