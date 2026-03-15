<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification
{
    use Queueable;

    protected $productName;
    protected $stockRemaining;

    /**
     * Create a new notification instance.
     */
    public function __construct($productName, $stockRemaining)
    {
        $this->productName = $productName;
        $this->stockRemaining = $stockRemaining;
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
            'product_name' => $this->productName,
            'stock_remaining' => $this->stockRemaining,
            'message' => "Stock bajo: {$this->productName} ({$this->stockRemaining} restantes)",
            'type' => 'stock'
        ];
    }
}
