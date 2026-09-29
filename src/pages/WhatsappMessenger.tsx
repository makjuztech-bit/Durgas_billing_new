import React, { useState } from 'react';
import {
    Send,
    MessageSquare,
    Users,
    Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const WhatsappMessenger: React.FC = () => {
    const [template, setTemplate] = useState('offer');
    const [message, setMessage] = useState('Hello! New Silk Saree collections have arrived at Lakshmi Silks. Visit us today for exclusive discounts!');

    const handleSend = () => {
        toast.success(`Broadcasting messages via WhatsApp API`);
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-display text-primary">WhatsApp Marketing</h1>
                <p className="text-muted-foreground">Send bulk offers, reminders and festive wishes.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5" /> Compose Broadcast
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Audience</Label>
                            <Select defaultValue="all">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Customers</SelectItem>
                                    <SelectItem value="vip">VIP Customers Only</SelectItem>
                                    <SelectItem value="due">Customers with Pending Due</SelectItem>
                                    <SelectItem value="inactive">Inactive (No purchase in 3 months)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Template</Label>
                            <Select value={template} onValueChange={(v) => {
                                setTemplate(v);
                                if (v === 'offer') setMessage('Hello! New Silk Saree collections have arrived at Lakshmi Silks. Visit us today for exclusive discounts!');
                                if (v === 'due') setMessage('Dear Customer, This is a gentle reminder regarding your pending balance. Please pay at the earliest.');
                                if (v === 'festival') setMessage('Happy Pongal! May this festival bring joy and prosperity. - Lakshmi Silks');
                            }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="offer">New Offer / Collection</SelectItem>
                                    <SelectItem value="due">Payment Reminder</SelectItem>
                                    <SelectItem value="festival">Festival Greeting</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Message Content</Label>
                            <Textarea
                                className="min-h-[150px]"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Variables like {'{Name}'} can be used.</p>
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleSend}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Send Broadcast
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle>Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-white p-4 rounded-lg shadow-sm border max-w-sm mx-auto relative">
                                <div className="bg-green-100 p-2 rounded-lg rounded-tl-none inline-block max-w-[90%] text-sm">
                                    <p>{message}</p>
                                    <span className="text-[10px] text-gray-500 block text-right mt-1">10:05 AM</span>
                                </div>
                            </div>
                            <div className="mt-6 text-center text-sm text-muted-foreground">
                                <p>Estimated Reach: <strong>1,240 Customers</strong></p>
                                <p>Cost Estimate: <strong>₹0.00</strong> (if using desktop automation)</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <Button variant="outline" className="justify-start">
                                <Users className="mr-2 h-4 w-4" /> Sync Contacts from Phone
                            </Button>
                            <Button variant="outline" className="justify-start">
                                <Gift className="mr-2 h-4 w-4" /> Configure Birthday Auto-Wishes
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default WhatsappMessenger;
