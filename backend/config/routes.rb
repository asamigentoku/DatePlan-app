Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :spots, only: [:index, :create]
      namespace :search do
        resources :get_spots_by_place,only: [:index,:show]
      end
    end
  end
end
