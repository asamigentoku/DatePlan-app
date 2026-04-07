class CreateSpots < ActiveRecord::Migration[8.1]
  def change
    create_table :spots do |t|
      t.string :name
      t.string :address
      t.integer :price

      t.timestamps
    end
  end
end
