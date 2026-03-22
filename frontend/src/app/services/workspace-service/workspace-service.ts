import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import Workspace from '../../models/workspace';
import { firstValueFrom } from 'rxjs';
import Message from '../../models/message';
import PrivateSpace from '../../models/private-space';

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

  async updateWorkspace(workspace: Workspace)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/workspace/update`,
          { workspace },
          { observe: 'response'}
        )
      );
      return response;
    } catch (error) {
      console.error("Failed to update workspace", error);
      return error;
    }
  }

  async addPrivateWorkspace(firmId:string, workspaceName:string, privateSpace: PrivateSpace)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/workspace/add-private`,
          { firmId, workspaceName, ...privateSpace },
          { observe: 'response'}
        )
      );
      return response;
    } catch (error) {
      console.error("Failed to add private workspaces", error);
      return error;
    }
  }

  async updatePrivateWorkspace(firmId: string, workspaceName: string, privateSpace: PrivateSpace)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/workspace/update-private`,
          { firmId, workspaceName, spaceName: privateSpace.spaceName, newDescription: privateSpace.description, 
            newCapacity: privateSpace.capacity, newPricePerHour: privateSpace.pricePerHour, newType: privateSpace.type },
          { observe: 'response'}
        )
      );
      return response;
    } catch (error) {
      console.error("Failed to add private workspaces", error);
      return error;
    }
  }

  async commentOnWorkspace(firmId: string, workspaceName: string, username: string, comment: string)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/workspace/comment`,
          { firmId, workspaceName, username, comment },
          { observe: 'response'}
        )
      );
      return response;
    } catch (error) {
      console.error("Failed to comment on workspace", error);
      return error;
    }
  }

  async rateWorkspace(firmId: string, workspaceName: string, username: string, ratingType: string)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/workspace/rate`,
          { firmId, workspaceName, username, ratingType },
          { observe: 'response'}
        )
      );
      return response;
    } catch (error) {
      console.error("Failed to rate workspace", error);
      return error;
    }
  }

  async uploadWorkspacePicture(firmId: string, workspaceName: string, workspacePicture: File)
  {
    try {
      const formData = new FormData();
      formData.append('firmId', firmId);
      formData.append('workspaceName', workspaceName);
      formData.append('workspacePicture', workspacePicture);

      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/workspace/upload-picture`,
          formData,
          { observe: 'response' }
        )
      );
      return response;
    } catch (error) {
      console.error('Failed to upload workspace picture', error);
      return error;
    }
  }

  async deleteWorkspacePicture(firmId: string, workspaceName: string, picturePath: string)
  {
    try {
      const response = await firstValueFrom(
        this.http.post<Message>(
          `${this.backUrl}/workspace/delete-picture`,
          { firmId, workspaceName, picturePath },
          { observe: 'response' }
        )
      );
      return response;
    } catch (error) {
      console.error('Failed to delete workspace picture', error);
      return error;
    }
  }

}
