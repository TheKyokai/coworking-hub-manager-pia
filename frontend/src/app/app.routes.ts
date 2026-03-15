import { Routes } from '@angular/router';
import { Login } from './authentication/login/login';
import { Registration } from './authentication/registration/registration';
import { AdminLogin } from './authentication/admin-login/admin-login';
import { Home } from './home/home';

export const routes: Routes = [
    {path: 'login', component: Login},
    {path: 'registration', component: Registration},
    {path: 'admin-login', component: AdminLogin},
    {path: '', component: Home},
];
