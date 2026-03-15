<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PendingLiveBagsNotification extends Notification
{
    use Queueable;

    protected $count;

    /**
     * Create a new notification instance.
     */
    public function __construct($count)
    {
        $this->count = $count;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'count' => $this->count,
            'message' => "Hay {$this->count} bolsas en espera de confirmación (live_draft).",
            'type' => 'pending_bags'
        ];
    }
}
