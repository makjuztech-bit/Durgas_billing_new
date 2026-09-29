import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Building2, Key, History, Mail } from 'lucide-react';
import { toast } from 'sonner';

const Profile: React.FC = () => {
    const { user, updateUserData } = useAuth();
    const [editName, setEditName] = useState(user?.name || '');
    const [editUsername, setEditUsername] = useState(user?.username || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    const handleUpdateProfile = async () => {
        if (!editName || !editUsername) {
            toast.error('Name and Username are required');
            return;
        }

        setIsUpdatingProfile(true);
        try {
            const response = await fetch(`${API_URL}/auth/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user?.username,
                    newName: editName,
                    newUsername: editUsername
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Profile updated successfully');
                updateUserData({ name: data.user.name, username: data.user.username });
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Error updating profile');
            console.error(error);
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword) {
            toast.error('Please enter a new password');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user?.username,
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Password updated successfully');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.message || 'Failed to update password');
            }
        } catch (error) {
            toast.error('Error updating password');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'default';
            case 'manager': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-display text-primary">My Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Personal Information
                        </CardTitle>
                        <CardDescription>Your account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-xl">{user?.name}</h3>
                                <p className="text-sm text-muted-foreground">@{user?.username}</p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant={getRoleColor(user?.role || '') as any} className="capitalize">
                                        {user?.role}
                                    </Badge>
                                    {user?.branch && (
                                        <Badge variant="outline" className="capitalize">
                                            {user.branch} Branch
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-4">
                            <div className="grid grid-cols-3 items-center">
                                <Label htmlFor="edit-name" className="text-muted-foreground font-medium">Full Name</Label>
                                <Input
                                    id="edit-name"
                                    className="col-span-2"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center">
                                <Label htmlFor="edit-username" className="text-muted-foreground font-medium">Username</Label>
                                <Input
                                    id="edit-username"
                                    className="col-span-2 font-mono"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center">
                                <Label className="text-muted-foreground font-medium">Role</Label>
                                <div className="col-span-2 capitalize text-sm font-semibold">{user?.role}</div>
                            </div>
                            <div className="grid grid-cols-3 items-center">
                                <Label className="text-muted-foreground font-medium">Branch</Label>
                                <div className="col-span-2 capitalize text-sm font-semibold">{user?.branch || 'Main'}</div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
                                {isUpdatingProfile ? 'Saving...' : 'Update Personal Info'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" /> Security
                        </CardTitle>
                        <CardDescription>Update your password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button onClick={handleUpdatePassword} disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Activity or Other Modules (Placeholder) */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" /> Session Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            Current Session ID: {user?.id || 'N/A'} <br />
                            Last Login: {new Date().toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
