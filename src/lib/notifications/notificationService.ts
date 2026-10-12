export type NotificationStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermissionStatus(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationStatus;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.debug('Bildirim izni istenirken hata:', e);
    return false;
  }
}

export function sendPlanoraNotification(
  title: string,
  options?: { body?: string; tag?: string }
): boolean {
  if (getNotificationPermissionStatus() !== 'granted') {
    return false;
  }
  try {
    new Notification(title, {
      icon: '/icon.svg',
      badge: '/icon.svg',
      ...options,
    });
    return true;
  } catch (e) {
    console.debug('Bildirim gönderilirken hata oluştu:', e);
    return false;
  }
}

export function notifyMorningPlan(taskCount: number, totalMinutes: number): void {
  sendPlanoraNotification('🌅 Planora: Bugünün Çalışma Planı Hazır!', {
    body: `Bugün için ${taskCount} derse toplam ${totalMinutes} dakika (${(totalMinutes / 60).toFixed(1)} saat) çalışma planlandı. Güne harika başla!`,
    tag: 'morning-plan',
  });
}

export function notifyBlockLeadTime(
  taskTitle: string,
  startTime: string,
  leadMinutes: number
): void {
  sendPlanoraNotification(`⏰ Çalışma Vakti Yaklaşıyor: ${taskTitle}`, {
    body: `Çalışma bloğunuz ${startTime} saatinde (${leadMinutes} dakika sonra) başlıyor. Masanızı hazırlayın!`,
    tag: `task-lead-${taskTitle}`,
  });
}

export function notifyPomodoroComplete(modeTitle: string, taskTitle: string): void {
  sendPlanoraNotification(`🎉 ${modeTitle} Tamamlandı!`, {
    body: `${taskTitle} oturumu başarıyla sonuçlandı. Harika bir odaklanma sergilediniz!`,
    tag: 'pomodoro-complete',
  });
}
