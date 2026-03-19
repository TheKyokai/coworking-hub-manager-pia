import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import Workspace from '../../models/workspace';
import { firstValueFrom } from 'rxjs';
import Message from '../../models/message';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  
  private backUrl = "http://localhost:4000";
  private http = inject(HttpClient);


  async getWorkspace(firmId: string, workspaceName: String)
  {
    return await this.http.get<Workspace>(`${this.backUrl}/workspace/get/${firmId}/${workspaceName}`);
  }

  async getAllWorkspaces()
  {
    try {
      const workspaces = await firstValueFrom(
        this.http.get<Workspace[]>(`${this.backUrl}/workspace/get-all`)
      );
      return workspaces;
    } catch (error) {
      console.error("Failed to fetch all workspaces", error);
      return [];
    }
  }

  async getWorkspacesByFirmId(firmId: string)
  {
    try {
      const workspaces = await firstValueFrom(
        this.http.get<Workspace[]>(`${this.backUrl}/workspace/firm/${firmId}`)
      );
      return workspaces;
    } catch (error) {
      console.error("Failed to fetch workspaces for firm", error);
      return [];
    }
  }

  async getPendingWorkspaces()
  {
    try {
      const workspaces = await firstValueFrom(
        this.http.get<Workspace[]>(`${this.backUrl}/workspace/pending-workspaces`)
      );
      return workspaces;
    } catch (error) {
      console.error("Failed to fetch pending workspaces", error);
      return [];
    }
  }

  async registerWorkspace(workspace: Workspace)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/workspace/register`,
          { workspace },
          { observe: 'response'}
        )
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch all workspaces", error);
      return error;
    }
  }


}
