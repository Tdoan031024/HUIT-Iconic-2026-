/**
 * Poster Generator for HUIT's ICONIC 2026
 * Generates an HD shareable story/feed card for social media (Facebook, Instagram, Zalo)
 */
import { Candidate } from './types';

export async function generateCandidatePoster(candidate: Candidate, siteUrl: string): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1440;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas 2d context');

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#060914');
  bgGrad.addColorStop(0.5, '#0B132B');
  bgGrad.addColorStop(1, '#050711');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient background glow spheres
  const topGlow = ctx.createRadialGradient(width * 0.2, height * 0.15, 10, width * 0.2, height * 0.15, 450);
  topGlow.addColorStop(0, 'rgba(10, 47, 255, 0.35)');
  topGlow.addColorStop(1, 'rgba(10, 47, 255, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, height);

  const bottomGlow = ctx.createRadialGradient(width * 0.8, height * 0.85, 10, width * 0.8, height * 0.85, 500);
  bottomGlow.addColorStop(0, 'rgba(121, 188, 194, 0.3)');
  bottomGlow.addColorStop(1, 'rgba(121, 188, 194, 0)');
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Elegant Outer Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  const goldGrad = ctx.createLinearGradient(36, 36, width - 36, height - 36);
  goldGrad.addColorStop(0, '#79BCC2');
  goldGrad.addColorStop(0.5, '#F59E0B');
  goldGrad.addColorStop(1, '#0A2FFF');
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(44, 44, width - 88, height - 88);

  // 4. Header: Contest Badge & Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Subtitle / School
  ctx.font = '800 24px "Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#79BCC2';
  ctx.fillText('TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH', width / 2, 70);

  // Title
  ctx.font = '900 48px "Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif';
  const titleGrad = ctx.createLinearGradient(width / 2 - 250, 0, width / 2 + 250, 0);
  titleGrad.addColorStop(0, '#FFFFFF');
  titleGrad.addColorStop(0.5, '#FDE047');
  titleGrad.addColorStop(1, '#79BCC2');
  ctx.fillStyle = titleGrad;
  ctx.fillText("HUIT'S ICONIC 2026", width / 2, 105);

  ctx.font = '600 20px "Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('CỔNG BÌNH CHỌN NÉT ĐẸP & ĐẠI SỨ SINH VIÊN', width / 2, 165);

  // 5. Load and Draw Candidate Image
  const imgY = 220;
  const imgW = 740;
  const imgH = 740;
  const imgX = (width - imgW) / 2;

  // Background box for image
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(imgX, imgY, imgW, imgH, 32);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 4;
  ctx.stroke();

  const candidateImg = new Image();
  candidateImg.crossOrigin = 'anonymous';

  // Safe image path resolution
  let resolvedImgUrl = candidate.imageUrl || '/duan/anhmauduan.png';
  if (!resolvedImgUrl.startsWith('http') && !resolvedImgUrl.startsWith('/')) {
    resolvedImgUrl = '/' + resolvedImgUrl;
  }
  candidateImg.src = resolvedImgUrl;

  await new Promise<void>((resolve) => {
    candidateImg.onload = () => resolve();
    candidateImg.onerror = () => {
      // Fallback if image load fails
      resolve();
    };
  });

  if (candidateImg.width > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, imgW, imgH, 32);
    ctx.clip();

    // Cover fit
    const imgAspect = candidateImg.width / candidateImg.height;
    const boxAspect = imgW / imgH;
    let renderW, renderH, renderX, renderY;

    if (imgAspect > boxAspect) {
      renderH = imgH;
      renderW = imgH * imgAspect;
      renderX = imgX - (renderW - imgW) / 2;
      renderY = imgY;
    } else {
      renderW = imgW;
      renderH = imgW / imgAspect;
      renderX = imgX;
      renderY = imgY - (renderH - imgH) / 2;
    }

    ctx.drawImage(candidateImg, renderX, renderY, renderW, renderH);
    ctx.restore();
  }

  // SBD Badge in Image Top Right
  const sbdBoxW = 210;
  const sbdBoxH = 64;
  const sbdBoxX = imgX + imgW - sbdBoxW - 20;
  const sbdBoxY = imgY + 20;

  ctx.fillStyle = 'rgba(11, 15, 25, 0.88)';
  ctx.beginPath();
  ctx.roundRect(sbdBoxX, sbdBoxY, sbdBoxW, sbdBoxH, 18);
  ctx.fill();
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 28px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillStyle = '#FDE047';
  ctx.fillText(`SBD: ${candidate.sbd}`, sbdBoxX + sbdBoxW / 2, sbdBoxY + sbdBoxH / 2);

  // 6. Candidate Name & Faculty
  const infoY = imgY + imgH + 35;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  ctx.font = '900 46px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(candidate.name.toUpperCase(), width / 2, infoY);

  ctx.font = '700 24px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillStyle = '#79BCC2';
  const facultyText = candidate.faculty || candidate.representativeSchool || 'ĐẠI HỌC CÔNG THƯƠNG TP.HCM';
  ctx.fillText(facultyText, width / 2, infoY + 60);

  // Table badge & Current Votes
  const tableText = candidate.contestTableLabel || (candidate.contestTable === 'MALE' ? 'BẢNG NAM' : candidate.contestTable === 'FEMALE' ? 'BẢNG NỮ' : 'THÍ SINH ICONIC');
  ctx.font = '800 22px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillStyle = '#F59E0B';
  ctx.fillText(`✨ ${tableText}  •  🗳️ ${candidate.votes.toLocaleString('vi-VN')} LƯỢT BÌNH CHỌN`, width / 2, infoY + 100);

  // 7. Footer: Direct QR Code to Vote
  const footerBoxY = height - 210;
  const voteUrl = `${siteUrl.replace(/\/$/, '')}/candidates/${candidate.sbd}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&data=${encodeURIComponent(voteUrl)}`;

  const qrImg = new Image();
  qrImg.crossOrigin = 'anonymous';
  qrImg.src = qrApiUrl;

  await new Promise<void>((resolve) => {
    qrImg.onload = () => resolve();
    qrImg.onerror = () => resolve();
  });

  const qrSize = 130;
  const qrX = 120;
  const qrY = footerBoxY + 15;

  if (qrImg.width > 0) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 16);
    ctx.fill();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  }

  // Instructions next to QR
  const textLeftX = qrX + qrSize + 30;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.font = '900 26px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('QUÉT MÃ ĐỂ BÌNH CHỌN NGAY!', textLeftX, qrY + 10);

  ctx.font = '600 20px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(`Ủng hộ cho thí sinh mang SBD ${candidate.sbd}`, textLeftX, qrY + 48);

  ctx.font = '700 18px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillStyle = '#79BCC2';
  ctx.fillText('🌐 iconic2026.huitmedia.edu.vn', textLeftX, qrY + 84);

  return canvas.toDataURL('image/png');
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
