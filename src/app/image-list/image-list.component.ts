import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { HydrusFile } from '../hydrus-file';
import { HydrusFilesService } from '../hydrus-files.service';
import { AppComponent } from '../app.component';
import { IPageInfo } from 'ngx-virtual-scroller';
import { PhotoswipeService } from '../photoswipe/photoswipe.service';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss']
})
export class ImageListComponent implements OnInit {

  @Input() fileIDs : number[] = [];

  //@ViewChild(PhotoswipeComponent, {static: true})
  //photoswipe: PhotoswipeComponent;

  currentFiles: HydrusFile[] = [];

  loading: boolean = false;

  loadAtOnce: number = 48;

  constructor(public filesService: HydrusFilesService, public appComponent: AppComponent, public photoswipe : PhotoswipeService) { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.currentFiles = [];
    this.fetchMore();
  }

  fetchMore(event?: IPageInfo) {
    if (
      (event && (
        (event.endIndex !== this.currentFiles.length-1) ||
        (event.endIndex+1 >= this.fileIDs.length)
        ) )|| this.loading) return;
    this.loading = true;

    this.filesService.getFileMetadata(this.fileIDs.slice(this.currentFiles.length, this.currentFiles.length + this.loadAtOnce)).subscribe((files) => {
      this.currentFiles = this.currentFiles.concat(files);
      this.loading = false;
    })
  }

  public scrollTrackByFunction(index: number, file: HydrusFile): number {
    return file.file_id;
  }

}
