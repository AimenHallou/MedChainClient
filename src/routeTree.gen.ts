/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SettingsImport } from './routes/settings'
import { Route as AuthImport } from './routes/auth'
import { Route as AccountImport } from './routes/account'
import { Route as IndexImport } from './routes/index'
import { Route as PatientPatientIdImport } from './routes/patient.$patientId'

// Create/Update Routes

const SettingsRoute = SettingsImport.update({
  path: '/settings',
  getParentRoute: () => rootRoute,
} as any)

const AuthRoute = AuthImport.update({
  path: '/auth',
  getParentRoute: () => rootRoute,
} as any)

const AccountRoute = AccountImport.update({
  path: '/account',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const PatientPatientIdRoute = PatientPatientIdImport.update({
  path: '/patient/$patientId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/account': {
      preLoaderRoute: typeof AccountImport
      parentRoute: typeof rootRoute
    }
    '/auth': {
      preLoaderRoute: typeof AuthImport
      parentRoute: typeof rootRoute
    }
    '/settings': {
      preLoaderRoute: typeof SettingsImport
      parentRoute: typeof rootRoute
    }
    '/patient/$patientId': {
      preLoaderRoute: typeof PatientPatientIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  AccountRoute,
  AuthRoute,
  SettingsRoute,
  PatientPatientIdRoute,
])

/* prettier-ignore-end */
