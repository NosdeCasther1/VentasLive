<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderReturnedNotification extends Notification
{
    use Queueable;

    protected $orderId;
    protected $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct($orderId, $reason)
    {
        $this->orderId = $orderId;
        $this->reason = $reason;
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
            'order_id' => $this->orderId,
            'reason' => $this->reason,
            'message' => "Pedido #{$this->orderId} ha sido devuelto. Motivo: {$this->reason}",
            'type' => 'return'
        ];
    }
}
