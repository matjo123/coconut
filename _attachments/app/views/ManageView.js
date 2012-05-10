// Generated by CoffeeScript 1.3.1
var ManageView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ManageView = (function(_super) {

  __extends(ManageView, _super);

  ManageView.name = 'ManageView';

  function ManageView() {
    this.render = __bind(this.render, this);
    return ManageView.__super__.constructor.apply(this, arguments);
  }

  ManageView.prototype.el = '#content';

  ManageView.prototype.render = function() {
    this.$el.html("      <a href='#sync'>Sync</a>      <a href='#configure'>Configure</a>      <h2>Question Sets</h2>      <a href='#design'>New</a>      <table>        <thead>          <th></th>          <th></th>          <th></th>          <th></th>        </thead>        <tbody>        </tbody>      </table>    ");
    $("a").button();
    return Coconut.questions.fetch({
      success: function() {
        Coconut.questions.each(function(question) {
          var questionId;
          questionId = escape(question.id);
          return $("tbody").append("            <tr>              <td>" + questionId + "</td>              <td><a href='#edit/" + questionId + "'>edit</a></td>              <td><a href='#delete/" + questionId + "'>delete</a></td>              <td><a href='#edit/resultSummary/" + questionId + "'>summary</a></td>            </tr>          ");
        });
        return $("table a").button();
      }
    });
  };

  return ManageView;

})(Backbone.View);