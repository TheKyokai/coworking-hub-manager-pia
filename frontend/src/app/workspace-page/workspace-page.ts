import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth-service/auth-service';
import { WorkspaceService } from '../services/workspace-service/workspace-service';
import User from '../models/user';
import Workspace from '../models/workspace';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { WorkspaceView } from "../workspace-view/workspace-view";

@Component({
  selector: 'app-workspace-page',
  imports: [WorkspaceView],
  templateUrl: './workspace-page.html',
  styleUrl: './workspace-page.css',
})
export class WorkspacePage implements OnInit{

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  
  user: User | null = null;
  workspace = new Workspace();

  async ngOnInit()
  {
    const user = await this.authService.getUser();
    if (user && user.role === 'user')
      this.user = user;
    const firmId = this.route.snapshot.paramMap.get('firmId');
    const workspaceName = this.route.snapshot.paramMap.get('name');
    if (!firmId || !workspaceName)
    {
      this.router.navigate(['']);
      return;
    }

    const ws = await firstValueFrom(await this.workspaceService.getWorkspace(
        firmId!,
        workspaceName!
      )
    );
    if (!ws)
    {
      this.router.navigate(['']);
      return;
    }
    this.workspace = ws;
  }
  
}
