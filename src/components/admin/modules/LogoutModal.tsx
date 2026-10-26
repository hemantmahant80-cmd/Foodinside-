import React, { useState } from 'react';
import { LogOut, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const [loggedOut, setLoggedOut] = useState(false);
  const { logOut, signInAsAdmin, user } = useAuth();

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    await logOut();
    setLoggedOut(true);
  };

  const handleReLogin = () => {
    signInAsAdmin();
    setLoggedOut(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {!loggedOut ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 text-center">
              Confirm Session Logout
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              You are signed in as <strong className="text-slate-800">{user?.displayName || 'Hemant Mahant'}</strong> ({user?.email === 'hemantmahant80@gmail.com' ? 'Super Admin' : 'Admin'} • Operations Lead). Are you sure you want to log out of the FoodInside Admin console?
            </p>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Successfully Signed Out
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your FoodInside Admin session has terminated securely.
            </p>

            <button
              onClick={handleReLogin}
              className="mt-5 w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign Back In as Super Admin</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
