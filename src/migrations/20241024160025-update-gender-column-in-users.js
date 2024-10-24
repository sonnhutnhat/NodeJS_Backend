'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'gender', {
      type: Sequelize.STRING, // Thay đổi kiểu dữ liệu thành STRING
      allowNull: true, // Bạn có thể thêm điều kiện này nếu không muốn bắt buộc
    });
  },

  async down(queryInterface, Sequelize) {
    // Định nghĩa logic revert về kiểu dữ liệu ban đầu (BOOLEAN)
    await queryInterface.changeColumn('Users', 'gender', {
      type: Sequelize.BOOLEAN,
      allowNull: true
    });
  }
};
