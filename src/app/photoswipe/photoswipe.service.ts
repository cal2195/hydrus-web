import { Injectable, ApplicationRef, Injector, ComponentFactoryResolver, ComponentRef, ElementRef } from '@angular/core';
import { PhotoswipeComponent } from './photoswipe.component';
import * as PhotoSwipe from 'photoswipe';
import * as PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default';
import { HydrusFile, HydrusFileType } from '../hydrus-file';
import { fromEvent, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PhotoswipeService {

  private photoswipeComponent: ComponentRef<PhotoswipeComponent>;
  private pspElement: ElementRef;

  ps: PhotoSwipe<{}>;

  public onMouseWheel$: Observable<WheelEvent>;
  public onMouse$: Observable<MouseEvent>;
  public psClose$ = new Subject();

  constructor(private applicationRef: ApplicationRef, private injector: Injector, private resolver: ComponentFactoryResolver) {
    this.photoswipeComponent = this.resolver.resolveComponentFactory(PhotoswipeComponent).create(this.injector);
    this.pspElement = this.photoswipeComponent.instance.pspElement;
    this.applicationRef.attachView(this.photoswipeComponent.hostView);
    document.body.appendChild(this.photoswipeComponent.location.nativeElement);

    this.onMouseWheel$ = fromEvent<WheelEvent>(this.photoswipeComponent.location.nativeElement, 'wheel');
    this.onMouse$ = fromEvent<MouseEvent>(this.photoswipeComponent.location.nativeElement, 'auxclick');
  }

  getPhotoSwipeItems(items : HydrusFile[]) : PhotoSwipe.Item[] {
    return items.map((i) => this.getPhotoSwipeItem(i));
  }

  getPhotoSwipeItem(file: HydrusFile) : PhotoSwipe.Item {
    if(file.file_type === HydrusFileType.Image) {
      return {
        src: file.file_url,
        msrc: file.thumbnail_url,
        w: file.width,
        h: file.height
      };
    } else if(file.file_type === HydrusFileType.Video) {
      return {
        html: `
        <div>
          <video poster="${file.thumbnail_url}" controls autoplay>
            <source src="${file.file_url}">
          </video>
        </div>`
      };
    } else {
      return {
        html: `<div class="pswp__error-msg">
        The file could not be loaded. (type: ${file.mime})
        </div>`
      };
    }
  }

  public openPhotoSwipe(items : HydrusFile[], id: number) {
    let imgindex = items.findIndex(e => e.file_id == id);

    let ps = new PhotoSwipe(this.pspElement.nativeElement, PhotoSwipeUI_Default, this.getPhotoSwipeItems(items),
    {
      index: imgindex,
      showHideOpacity: false,
      history: false,
      shareEl: false,
      closeOnScroll: false,
      hideAnimationDuration:0,
      showAnimationDuration:0
    });
    ps.listen('close', () => {
      this.psClose$.next();
    });
    ps.init();
    this.onMouseWheel$.pipe(takeUntil(this.psClose$)).subscribe((event) => {
      if(event.deltaY < 0) { //wheel up
        ps.prev();
      } else if (event.deltaY > 0) { //wheel down
        ps.next();
      }
    });
    this.onMouse$.pipe(takeUntil(this.psClose$)).subscribe((event) => {
      if(event.button == 1) {
        ps.close();
      }
    })

  }

}
