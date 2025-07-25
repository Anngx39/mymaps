// src/app/components/file-card/file-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { MapShareService } from '../../services/map-share.service';
import { NavController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

interface likeresponse {
  message: string;
  like: number;
}

interface dislikeresponse {
  message: string;
  dislike: number;
}

@Component({
  selector: 'app-file-card',
  templateUrl: './file-card.component.html',
  styleUrls: ['./file-card.component.scss'],
  standalone: false,
})
export class FileCardComponent {
  @Input() file: any; // nhận dữ liệu file đầu vào
  @Output() cardClick = new EventEmitter<string>(); // đầu ra của sự kiện cardclick, phát ra chuỗi ký tự id
  @Output() deleted = new EventEmitter<void>();
  @Output() reloadTabs = new EventEmitter<void>();
  hasLiked: boolean = false; // biến để kiểm tra người dùng đã like chưa
  hasDisliked: boolean = false; // biến để kiểm tra người dùng đã dislike chưa

  constructor(
    private documentService: DocumentService,
    private mapShareService: MapShareService,
    private navCtrl: NavController
  ) {}
  // khi click vào thẻ, sẽ chuyển đến trang explore và hiển thị bản đồ
  onClickCard() {
    if (this.file && this.file.map_id) {
      this.mapShareService.setMapId(this.file.map_id);
      this.navCtrl.navigateRoot(['/tabs/tab1']);
    }
    // Khi thẻ được bấm, phát ra(evenemiter) sự kiện kèm theo ID của tệp
    if (this.file && this.file.id) {
      this.cardClick.emit(this.file.id); //emit() hàm gửi thông báo sự kiện click và gửi id của tài liệu
    }
  }

  onLike() {
    if (this.file && this.file.map_id && !this.hasLiked) {
      this.documentService.upVote(this.file.map_id).subscribe({
        next: (response: likeresponse) => {
          if (response.message === 'You voted this map') {
            console.log('đã like');
            this.hasLiked = true; // Đánh dấu đã Like
            return;
          } else {
            this.file.like = this.file.like + 1;
            console.log('Like thành công');
          }
        },
        error: (err) => {
          console.error('Lỗi khi Like:', err);
        },
      });
    } else {
      console.log('Đã Like rồi');
    }
  }

  onDislike() {
    if (this.file && this.file.map_id && !this.hasDisliked) {
      this.documentService.downVote(this.file.map_id).subscribe({
        next: (response: dislikeresponse) => {
          if (response.message === 'You voted this map') {
            console.log('Đã Dislike');
            this.hasDisliked = true; // Đánh dấu đã Dislike
            return;
          } else {
            this.file.dislike = this.file.dislike + 1;
            console.log('Dislike thành công');
          }
        },
        error: (err) => {
          console.error('Lỗi khi Dislike:', err);
        },
      });
    } else {
      console.log('đã Dislike rồi');
    }
  }

  onImportTemplate(event: Event) {
    event.stopPropagation();
    if (this.file && this.file.map_id) {
      this.documentService.importTemplate(this.file.map_id).subscribe({
        next: (res) => {
          console.log('Import thành công:', res);
        },
        error: (err) => {
          console.error('Lỗi import:', err);
        },
      });
    }
  }

  // Phương thức cắt ngắn văn bản và thêm dấu ba chấm
  truncateText(text: string, maxLength: number = 35): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  truncateName(text: string, maxLength: number = 25): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}