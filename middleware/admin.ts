export default defineNuxtRouteMiddleware((to, from) => {
  const { user, userType } = useAuth()
  
  // ユーザーが未認証の場合
  if (!user.value) {
    console.log('🚫 Middleware: User not authenticated, redirecting to login')
    return navigateTo('/auth/login')
  }
  
  // 管理者権限がない場合
  if (userType.value !== 'admin') {
    console.log('🚫 Middleware: User is not admin, redirecting to home')
    return navigateTo('/')
  }
  
  console.log('✅ Middleware: Admin access granted')
})