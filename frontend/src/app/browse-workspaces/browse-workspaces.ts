import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service/auth-service';
import Workspace from '../models/workspace';
import { WorkspaceService } from '../services/workspace-service/workspace-service';
import User from '../models/user';


@Component({
  selector: 'app-browse-workspaces',
  imports: [CommonModule, FormsModule],
  templateUrl: './browse-workspaces.html',
  styleUrl: './browse-workspaces.css',
})
export class BrowseWorkspaces implements OnInit{

  private authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  private router = inject(Router);


  user: User | null = null;
  allWorkspaces: Workspace[] = [];
  filteredWorkspaces: Workspace[] = [];
  cities: string[] = [];
  
  searchName: string = '';
  selectedCities: string[] = [];
  showCitiesDropdown: boolean = false;
  
  sortColumn: string | null = null;
  sortDirection: string = 'asc';

  selectedCheckbox: string = '';
  officeCap = 0;

  async ngOnInit()
  {
    this.user = await this.authService.getUser();
    this.loadWorkspaces();
  }

  async loadWorkspaces()
  {
    this.allWorkspaces = await this.workspaceService.getAllWorkspaces();
    this.allWorkspaces = this.allWorkspaces.filter(ws => ws.status === 'approved');
    this.filteredWorkspaces = this.allWorkspaces;
    
    this.allWorkspaces.forEach(ws => {
      if (!this.cities.includes(ws.city))
        this.cities.push(ws.city);
    });
    this.cities.sort();
  }

  async filterResults()
  {
    await this.loadWorkspaces();
    this.filteredWorkspaces = this.allWorkspaces.filter(ws => {
      const matchesName = ws.name.toLowerCase().includes(this.searchName.toLowerCase());
      const matchesCity = this.selectedCities.length === 0 || this.selectedCities.includes(ws.city);

      let matchesType = true;
      if (this.selectedCheckbox !== '')
      {
        if (this.selectedCheckbox === 'open-space')
          matchesType = ws.privateSpaces.length === 0;
        if (this.selectedCheckbox === 'office')
          matchesType = ws.privateSpaces.filter(ps => ps.type === 'office' && ps.capacity >= this.officeCap).length > 0;
        if (this.selectedCheckbox === 'conference')
          matchesType = ws.privateSpaces.filter(ps => ps.type === 'conference').length > 0;
      }

      return matchesName && matchesCity && matchesType;
    });
  }

  onSearchChange()
  {
    this.filterResults();
  }

  onCityChange()
  {
    this.filterResults();
  }

  clearFilters()
  {
    this.searchName = '';
    this.selectedCities = [];
    this.showCitiesDropdown = false;
    this.selectedCheckbox = '';
    this.filterResults();
  }

  toggleCityDropdown()
  {
    this.showCitiesDropdown = !this.showCitiesDropdown;
  }

  toggleCity(city: string)
  {
    const index = this.selectedCities.indexOf(city);
    if (index > -1) {
      this.selectedCities.splice(index, 1);
    } else {
      this.selectedCities.push(city);
    }
    this.filterResults();
  }

  isCitySelected(city: string): boolean
  {
    return this.selectedCities.includes(city);
  }

  sortByColumn(column: string)
  {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  applySort()
  {
    if (!this.sortColumn) return;

    this.filteredWorkspaces.sort((a, b) => {
      let aValue = '';
      let bValue = '';

      if (this.sortColumn === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (this.sortColumn === 'city') {
        aValue = a.city.toLowerCase();
        bValue = b.city.toLowerCase();
      }

      const comparison = aValue.localeCompare(bValue, 'sr-RS');
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getSortIndicator(column: string): string
  {
    if (this.sortColumn !== column) 
      return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  isSortable(column: string): boolean
  {
    return this.sortColumn === column;
  }

  viewWorkspaceDetails(workspace: Workspace)
  {
    this.router.navigate(['/workspace', workspace.firmId, workspace.name]);
  }

  getPrivateSpacesDisplay(privateSpaces: any[] | undefined)
  {
    if (!privateSpaces || privateSpaces.length === 0) {
      return [];
    }
    return privateSpaces;
  }

  getLikeCount(workspace: Workspace)
  {
    return workspace.ratings.filter(r => r.rating === 'like').length;
  }


  selectCheckbox(box: string)
  {
    if (this.selectedCheckbox === box) {
      this.selectedCheckbox = '';
    } else {
      this.selectedCheckbox = box;
    }
    this.filterResults()
  }

  checkboxDisabled(box: string)
  {
    if (this.selectedCheckbox === '')
      return false;
    return this.selectedCheckbox !== box
  }

  preventNegative(event: Event)
  {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    if (value.includes('-') || value.includes('+')) {
      value = value.replace(/[-+]/g, '');
      input.value = value;
    }
    this.filterResults();
  }

}
