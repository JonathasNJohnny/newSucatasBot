import { useEffect, useState } from "react";
import Navbar from "../../components/navbar/navbar";
import { useTwitchAuth } from "../../context/TwitchAuthContext";
import {
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  createCustomReward,
  getCustomRewards,
  deleteCustomReward,
  type CustomReward,
  type CreateRewardParams,
} from "../../utils/twitchRedemptions/rewardManagement";

export default function Redemptions() {
  const { isConnected, user, token } = useTwitchAuth();
  const [ourRewards, setOurRewards] = useState<CustomReward[]>([]);
  const [otherRewards, setOtherRewards] = useState<CustomReward[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<CreateRewardParams>({
    title: "",
    cost: 100,
    prompt: "",
    is_enabled: true,
    background_color: "#9146FF",
    is_user_input_required: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [confirmingDeleteIds, setConfirmingDeleteIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (isConnected && user && token) {
      loadRewards();
    } else {
      setOurRewards([]);
      setOtherRewards([]);
    }
  }, [isConnected, user, token]);

  const loadRewards = async () => {
    if (!token || !user) return;
    setLoading(true);
    setError(null);
    try {
      const [manageable, all] = await Promise.all([
        getCustomRewards(token, user.id, true),
        getCustomRewards(token, user.id, false),
      ]);

      const manageableIds = new Set(manageable.map((r) => r.id));
      const our = all.filter((r) => manageableIds.has(r.id));
      const other = all.filter((r) => !manageableIds.has(r.id));

      setOurRewards(our);
      setOtherRewards(other);
    } catch (err) {
      setError("Erro ao carregar recompensas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReward = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!token || !user) return;
    setCreating(true);
    setError(null);
    try {
      await createCustomReward(token, user.id, formData);
      setShowCreateModal(false);
      setFormData({
        title: "",
        cost: 100,
        prompt: "",
        is_enabled: true,
        background_color: "#9146FF",
        is_user_input_required: false,
      });
      loadRewards();
    } catch (err) {
      setError("Erro ao criar recompensa");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (!token || !user) return;
    if (confirmingDeleteIds.has(rewardId)) {
      // Second click - actually delete
      setConfirmingDeleteIds((prev) => {
        const next = new Set(prev);
        next.delete(rewardId);
        return next;
      });
      try {
        await deleteCustomReward(token, user.id, rewardId);
        loadRewards();
      } catch (err) {
        setError("Erro ao excluir recompensa");
        console.error(err);
      }
    } else {
      // First click - enter confirmation mode
      setConfirmingDeleteIds((prev) => new Set(prev).add(rewardId));
      // Auto-cancel after 3 seconds
      setTimeout(() => {
        setConfirmingDeleteIds((prev) => {
          const next = new Set(prev);
          next.delete(rewardId);
          return next;
        });
      }, 3000);
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Resgates</h1>
          {isConnected && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Nova Recompensa
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">
              Conecte na Twitch para gerenciar recompensas
            </p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Our App Rewards + Create New */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Nossas Recompensas
                </h2>
                {ourRewards.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma recompensa criada pelo nosso app
                  </p>
                ) : (
                  <div className="space-y-3">
                    {ourRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          {reward.image?.url_1x && (
                            <img
                              src={reward.image.url_1x}
                              alt={reward.title}
                              className="w-10 h-10 rounded"
                            />
                          )}
                          <div className="text-left">
                            <p className="font-medium text-white">
                              {reward.title}
                            </p>
                            <p className="text-sm text-gray-400">
                              {reward.cost} pontos
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {confirmingDeleteIds.has(reward.id) ? (
                            <button
                              onClick={() => handleDeleteReward(reward.id)}
                              className="px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 transition flex items-center gap-1.5"
                              title="Confirmar exclusão"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteReward(reward.id)}
                              className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create New Reward Card */}
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 border-dashed">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full flex items-center justify-center gap-3 p-6 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-lg">Criar nova recompensa</span>
                </button>
              </div>
            </div>

            {/* Right: Other Apps Rewards */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                  Recompensas de Outros Apps
                </h2>
                {otherRewards.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma recompensa de outros apps
                  </p>
                ) : (
                  <div className="space-y-3">
                    {otherRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          {reward.image?.url_4x && (
                            <img
                              src={reward.image.url_4x}
                              alt={reward.title}
                              className="w-10 h-10 rounded"
                            />
                          )}
                          <div className="text-left">
                            <p className="font-medium text-white">
                              {reward.title}
                            </p>
                            <p className="text-sm text-gray-400">
                              {reward.cost} pontos
                            </p>
                            <p className="text-xs text-gray-500">
                              Gerenciado por: {reward.broadcaster_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Reward Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Criar Nova Recompensa
              </h2>
              <form onSubmit={handleCreateReward} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500"
                    required
                    maxLength={45}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Custo (pontos)
                  </label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cost: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500"
                    required
                    min={1}
                    max={1000000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Descrição (prompt)
                  </label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) =>
                      setFormData({ ...formData, prompt: e.target.value })
                    }
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500"
                    rows={3}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Cor de fundo (hex)
                  </label>
                  <input
                    type="color"
                    value={formData.background_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        background_color: e.target.value,
                      })
                    }
                    className="w-full h-10 bg-gray-900 border border-gray-600 rounded-lg outline-none focus:border-purple-500 cursor-pointer"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_user_input_required}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_user_input_required: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">
                    Exigir entrada de texto do usuário
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_enabled}
                    onChange={(e) =>
                      setFormData({ ...formData, is_enabled: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">Habilitada</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !formData.title.trim()}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Criando...
                      </span>
                    ) : (
                      "Criar Recompensa"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
