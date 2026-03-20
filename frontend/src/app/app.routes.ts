import { Routes } from '@angular/router';
import { Login } from './authentication/login/login';
import { Registration } from './authentication/registration/registration';
import { AdminLogin } from './authentication/admin-login/admin-login';
import { Home } from './home/home';
import { ForgottenPassword } from './authentication/forgotten-password/forgotten-password';
import { ResetPassword } from './authentication/reset-password/reset-password';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { AdminUserProfile } from './admin/admin-user-profile/admin-user-profile';
import { Dashboard } from './registered-user/dashboard/dashboard';
import { WorkspacePage } from './workspace-page/workspace-page';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'registration', component: Registration},
    {path: 'login', component: Login},
    {path: 'dashboard', component: Dashboard},
    {path: 'admin-login', component: AdminLogin},
    {path: 'admin-dashboard', component: AdminDashboard},
    {path: 'admin-user-profile/:username', component: AdminUserProfile},
    {path: 'forgotten-password', component: ForgottenPassword},
    {path: 'reset-password/:token', component: ResetPassword},
    {path: 'workspace/:firmId/:name', component: WorkspacePage},
];
