const getFileExtension = (fileName = '') => {
  const clean = fileName.split('?')[0].split('#')[0];
  const parts = clean.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const getAttachmentKind = (attachment = {}) => {
  const mimeType = (attachment.mimeType || '').toLowerCase();
  const ext = getFileExtension(attachment.fileName || attachment.url || '');
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (/word|msword|officedocument\.wordprocessingml/.test(mimeType) || ['doc', 'docx'].includes(ext)) return 'word';
  if (/excel|spreadsheet|csv/.test(mimeType) || ['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
  if (/powerpoint|presentation/.test(mimeType) || ['ppt', 'pptx'].includes(ext)) return 'powerpoint';
  if (/zip|compressed|archive|x-rar|7z/.test(mimeType) || ['zip', 'rar', '7z'].includes(ext)) return 'zip';
  return 'file';
};

export const sanitizeMessageAttachments = (attachments = []) => {
  if (!Array.isArray(attachments)) return [];

  return attachments
    .filter(att => att && typeof att === 'object' && att.url && !String(att.url).startsWith('data:'))
    .map(att => ({
      fileName: att.fileName || '',
      url: att.url || '',
      publicId: att.publicId || '',
      mimeType: att.mimeType || '',
      size: Number(att.size) || 0,
      resourceType: att.resourceType || 'raw',
      format: att.format || '',
    }));
};

export const getAttachmentMessagePreview = (attachment = {}) => {
  const kind = getAttachmentKind(attachment);
  if (kind === 'image') return 'Photo';
  if (kind === 'video') return 'Video';
  return attachment.fileName || 'Attachment';
};

export const getMessagePreviewText = (message = {}) => {
  if (message.deletedAt) return message.content || 'This message was deleted';
  const content = (message.content || '').trim();
  if (content) return content;
  const firstAttachment = Array.isArray(message.attachments) ? message.attachments[0] : null;
  return firstAttachment ? getAttachmentMessagePreview(firstAttachment) : '';
};
