import { createLogger } from '~/utils/logger'

export default defineNuxtRouteMiddleware((to, from) => {
  const logger = createLogger('AdminMiddleware')
  const { user, isAdmin } = useAuth()
  
  // ユーザーが未認証の場合
  if (!user.value) {
    logger.debug('User not authenticated, redirecting to login')
    return navigateTo('/auth/login')
  }
  
  // 管理者権限がない場合
  if (!isAdmin.value) {
    logger.debug('User is not admin, redirecting to home')
    return navigateTo('/')
  }
  
  logger.debug('Admin access granted')
})