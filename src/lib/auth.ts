import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Para este proyecto, usaremos credenciales hardcodeadas
        // En producción, esto debería validarse contra base de datos con hash
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@joangelnails.com'
        const adminPassword = process.env.ADMIN_PASSWORD || 'JoangelAdmin2025!'

        if (credentials.email === adminEmail && credentials.password === adminPassword) {
          // Buscar o crear usuario admin
          let user = await prisma.user.findUnique({
            where: { email: adminEmail }
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: adminEmail,
                name: 'Administrador Joangel Nails',
                role: 'admin'
              }
            })
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
}