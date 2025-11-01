import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail, MapPin, Home, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getUserProfile, updateUserProfile } from "@/Services/login";
import { addUserData } from "@/features/user/userFeatures";

function UserProfile() {
  const user = useSelector((state) => state.editUser.userData);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    contactNumber: user?.contactNumber || "",
    permanentAddress: user?.permanentAddress || "",
    currentAddress: user?.currentAddress || "",
  });

  // Fetch latest user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      if (response.data?.user) {
        dispatch(addUserData(response.data.user));
        setFormData({
          fullName: response.data.user.fullName || "",
          email: response.data.user.email || "",
          contactNumber: response.data.user.contactNumber || "",
          permanentAddress: response.data.user.permanentAddress || "",
          currentAddress: response.data.user.currentAddress || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Generate initials from full name
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Generate a color based on the name
  const getProfileColor = (name) => {
    if (!name) return "#4F46E5";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "#4F46E5", // Indigo
      "#7C3AED", // Purple
      "#DC2626", // Red
      "#EA580C", // Orange
      "#16A34A", // Green
      "#0891B2", // Cyan
      "#2563EB", // Blue
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await updateUserProfile({
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
        permanentAddress: formData.permanentAddress,
        currentAddress: formData.currentAddress,
      });

      if (response.data?.user) {
        dispatch(addUserData(response.data.user));
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-all">
          {/* Profile Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
            style={{ backgroundColor: getProfileColor(user?.fullName) }}
          >
            {getInitials(user?.fullName)}
          </div>
          {/* User Name */}
          <div className="hidden md:block">
            <p className="font-semibold text-gray-800">{user?.fullName || "Guest User"}</p>
            <p className="text-xs text-gray-500">View Profile</p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            View and manage your profile information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg"
              style={{ backgroundColor: getProfileColor(user?.fullName) }}
            >
              {getInitials(user?.fullName)}
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Full Name
              </label>
              {isEditing ? (
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-700 pl-6">{user?.fullName || "Not provided"}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                Email Address
              </label>
              {isEditing ? (
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  disabled
                  className="bg-gray-50"
                />
              ) : (
                <p className="text-gray-700 pl-6">{user?.email || "Not provided"}</p>
              )}
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                Contact Number
              </label>
              {isEditing ? (
                <Input
                  name="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your contact number"
                />
              ) : (
                <p className="text-gray-700 pl-6">
                  {user?.contactNumber || "Not provided"}
                </p>
              )}
            </div>

            {/* Current Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Current Address
              </label>
              {isEditing ? (
                <Textarea
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your current address"
                  rows={2}
                />
              ) : (
                <p className="text-gray-700 pl-6">
                  {user?.currentAddress || "Not provided"}
                </p>
              )}
            </div>

            {/* Permanent Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-500" />
                Permanent Address
              </label>
              {isEditing ? (
                <Textarea
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your permanent address"
                  rows={2}
                />
              ) : (
                <p className="text-gray-700 pl-6">
                  {user?.permanentAddress || "Not provided"}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    fullName: user?.fullName || "",
                    email: user?.email || "",
                    contactNumber: user?.contactNumber || "",
                    permanentAddress: user?.permanentAddress || "",
                    currentAddress: user?.currentAddress || "",
                  });
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserProfile;
