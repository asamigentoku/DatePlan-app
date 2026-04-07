# app/controllers/api/v1/spots_controller.rb
module Api
    module V1
        class SpotsController < ApplicationController
        # GET /api/v1/spots
        def index
            spots = Spot.all
            render json: spots
        end
        # POST /api/v1/spots
        def create
            spot = Spot.new(spot_params)
            if spot.save
            render json: spot, status: :created
            else
            render json: { errors: spot.errors.full_messages }, status: :unprocessable_entity
            end
        end
        private
        #privateに定義やメソッドを置くことで、コントローラー内でのみ使用できるようになります。
        def spot_params
            params.require(:spot).permit(:name, :address, :price)
        end
        end
    end
end