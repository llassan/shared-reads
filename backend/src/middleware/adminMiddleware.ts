import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/env'

export interface AdminRequest extends Request {
  admin?: {
    adminId: string
    email: string
    role: string
  }
}

/**
 * Admin authentication middleware
 */
export const adminAuthMiddleware = (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' })
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwt.accessSecret) as {
      adminId: string
      email: string
      role: string
    }

    // Attach admin info to request
    req.admin = {
      adminId: decoded.adminId,
      email: decoded.email,
      role: decoded.role,
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' })
      return
    }
    res.status(500).json({ error: 'Authentication error' })
  }
}

/**
 * Super admin only middleware
 */
export const superAdminOnly = (req: any, res: Response, next: NextFunction) => {
  if (req.admin?.role !== 'SUPER_ADMIN') {
    res.status(403).json({ error: 'Forbidden: Super admin access required' })
    return
  }
  next()
}
